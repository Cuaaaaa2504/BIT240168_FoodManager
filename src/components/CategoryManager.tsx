import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import axios from 'axios';
import {CategoryInUseError, deleteCategory, getCategories, getDishes} from '../services/api';
import type {ApiDish, ApiDishCategory} from '../services/api';

type Props = {
  visible: boolean;
  language: 'en' | 'vi';
  onClose: () => void;
  onChanged: () => void;
};
const labels = {
  en: {title: 'Dish categories', close: 'Close', refresh: 'Refresh', remove: 'Delete', cancel: 'Cancel', confirm: 'Delete this category?', warning: 'This action cannot be undone.', inUse: 'This category is used by one or more dishes, including unavailable dishes. It cannot be deleted.', error: 'Could not complete the request. Check your connection and refresh before retrying.', missing: 'This category no longer exists.', empty: 'No categories found.', count: 'Dishes', hint: 'Only categories without dishes can be deleted.'},
  vi: {title: 'Loại món ăn', close: 'Đóng', refresh: 'Tải lại', remove: 'Xóa', cancel: 'Hủy', confirm: 'Xóa loại món này?', warning: 'Không thể hoàn tác thao tác này.', inUse: 'Loại này đang được sử dụng bởi một hoặc nhiều món, kể cả món ngừng bán. Không thể xóa.', error: 'Không thực hiện được yêu cầu. Kiểm tra mạng và tải lại trước khi thử lại.', missing: 'Loại món này không còn tồn tại.', empty: 'Chưa có loại món.', count: 'Số món', hint: 'Chỉ được xóa loại chưa có món ăn sử dụng.'},
};

export default function CategoryManager({visible, language, onClose, onChanged}: Props): React.JSX.Element {
  const t = labels[language];
  const [categories, setCategories] = useState<ApiDishCategory[]>([]);
  const [dishes, setDishes] = useState<ApiDish[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const lock = useRef(false);
  const dialog = useRef(false);

  async function refresh(): Promise<void> {
    if (lock.current) {return;}
    lock.current = true;
    setLoading(true);
    setFailed(false);
    try {
      const [nextCategories, nextDishes] = await Promise.all([getCategories(), getDishes()]);
      setCategories(nextCategories);
      setDishes(nextDishes);
    } catch {setFailed(true);}
    finally {lock.current = false; setLoading(false);}
  }

  useEffect(() => {if (visible) {void refresh();}}, [visible]);

  function count(category: ApiDishCategory): number {
    return dishes.filter(dish => dish.BIT240168_DishCategoryId === category.BIT240168_Id).length;
  }

  async function remove(category: ApiDishCategory): Promise<void> {
    if (lock.current) {return;}
    lock.current = true;
    setDeleting(true);
    let changed = false;
    try {
      await deleteCategory(category.id);
      setCategories(current => current.filter(item => item.id !== category.id));
      changed = true;
    } catch (error: unknown) {
      if (error instanceof CategoryInUseError) {
        Alert.alert(t.title, t.inUse);
      } else if (axios.isAxiosError(error) && error.response?.status === 404) {
        setCategories(current => current.filter(item => item.id !== category.id));
        changed = true;
        Alert.alert(t.title, t.missing);
      } else {
        Alert.alert(t.title, t.error);
      }
    } finally {
      lock.current = false;
      setDeleting(false);
      if (changed) {onChanged();}
      void refresh();
    }
  }

  function confirm(category: ApiDishCategory): void {
    if (lock.current || dialog.current || failed) {return;}
    if (count(category) > 0) {Alert.alert(t.title, t.inUse); return;}
    dialog.current = true;
    Alert.alert(t.confirm, `${category.BIT240168_Name}\n\n${t.warning}`, [
      {text: t.cancel, style: 'cancel', onPress: () => {dialog.current = false;}},
      {text: t.remove, style: 'destructive', onPress: () => {dialog.current = false; void remove(category);}},
    ], {cancelable: true, onDismiss: () => {dialog.current = false;}});
  }

  const busy = loading || deleting;
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={() => {if (!lock.current && !dialog.current) {onClose();}}}>
      <SafeAreaProvider>
        <SafeAreaView style={s.screen}>
          <View style={s.header}>
            <Text style={s.title}>{t.title}</Text>
            <Pressable disabled={busy} onPress={onClose}><Text style={s.link}>{t.close}</Text></Pressable>
          </View>
          <ScrollView contentContainerStyle={s.content}>
            <Text style={s.hint}>{t.hint}</Text>
            <Pressable disabled={busy} onPress={() => void refresh()}><Text style={s.link}>{t.refresh}</Text></Pressable>
            {busy && <ActivityIndicator color="#ed7034" style={s.spinner} />}
            {failed && <Text style={s.error}>{t.error}</Text>}
            {!busy && !failed && categories.length === 0 && <Text style={s.hint}>{t.empty}</Text>}
            {categories.map(category => (
              <View key={category.id} style={s.card}>
                <Text style={s.name}>{category.BIT240168_Name}</Text>
                {!!category.BIT240168_Description && <Text style={s.hint}>{category.BIT240168_Description}</Text>}
                <Text style={s.hint}>{t.count}: {count(category)}</Text>
                <Pressable disabled={busy || failed} onPress={() => confirm(category)} style={[s.button, (busy || failed) && s.disabled]}>
                  <Text style={s.error}>{t.remove}</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const s = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#fffaf5'},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18},
  title: {fontSize: 23, fontWeight: '800', color: '#543220', flex: 1},
  link: {color: '#d9652c', padding: 10, fontWeight: '700'},
  content: {padding: 20, paddingBottom: 40},
  hint: {color: '#8b7565', lineHeight: 22, marginBottom: 8},
  card: {backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginTop: 14, borderWidth: 1, borderColor: '#efdfd1'},
  name: {fontSize: 18, fontWeight: '700', color: '#543220', marginBottom: 8},
  button: {alignSelf: 'flex-start', padding: 10, backgroundColor: '#fff0eb', borderRadius: 10},
  error: {color: '#b64738', lineHeight: 22},
  disabled: {opacity: 0.5},
  spinner: {marginVertical: 14},
});
