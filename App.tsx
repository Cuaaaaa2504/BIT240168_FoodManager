import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Switch, Text, TextInput, View} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import axios from 'axios';
import {createDish, deleteDish, getCategories, getDishes, updateDish} from './src/services/api';
import type {ApiDish, ApiDishCategory} from './src/services/api';
import type {Dish, DishImage} from './src/models/Dish';
import {validateDish} from './src/utils/validation';
import CategoryManager from './src/components/CategoryManager';

type Language = 'en' | 'vi';
type Availability = 'all' | 'available' | 'unavailable';
type SortOrder = 'default' | 'priceAsc' | 'priceDesc' | 'timeAsc';
type Screen = 'detail' | 'form' | null;
type Draft = {businessId: string; name: string; price: string; preparationTime: string; categoryId: string; available: boolean; description: string; images: DishImage[]};

const words = {
  en: {brand:'Food Manager', heading:'Your menu, beautifully managed.', subtitle:'Good food. Simple management.', total:'Total dishes', selling:'Available', quickCount:'Quick dishes', search:'Search dishes...', all:'All', filters:'Filters', reset:'Reset', status:'Availability', available:'Available', unavailable:'Unavailable', min:'Min price', max:'Max price', sort:'Sort by', default:'Default', priceAsc:'Price: low to high', priceDesc:'Price: high to low', timeAsc:'Preparation: fastest', results:'Dishes', empty:'No dishes found', emptyHint:'Try another keyword or reset your filters.', loadError:'Could not load data. Check your connection.', retry:'Retry', invalidPrice:'Prices must be valid non-negative numbers. Minimum must not exceed maximum.', quick:'Quick', regular:'Regular', minutes:'min', noImage:'No image', category:'Category', manageCategories:'Dish categories', unknownCategory:'Unknown category', preparation:'Preparation time', description:'Description', noDescription:'No description yet.', gallery:'Dish photos', close:'Close', details:'Dish details', removed:'This dish no longer exists. Refresh the list.', delete:'Delete dish', deleteTitle:'Delete this dish?', deleteMessage:'This action cannot be undone.', cancel:'Cancel', deleting:'Deleting...', deleteError:'Could not delete. Refresh the list to check before trying again.', add:'Add dish', edit:'Edit dish', name:'Dish name', price:'Price (VND)', time:'Preparation time (minutes)', save:'Save dish', saving:'Saving...', imageUrl:'Image URL', addImage:'Add image', removeImage:'Remove', thumbnail:'Cover image', setThumbnail:'Use as cover', imageHint:'Add HTTP/HTTPS image links. Select at most one cover.', noCategories:'No categories available. Create a category in MockAPI, then refresh.', formHint:'Enter the original dish name and description.', nameRequired:'Dish name is required.', priceInvalid:'Price must be a number greater than 0.', preparationTimeInvalid:'Preparation time must be a number greater than 0.', categoryInvalid:'Select an existing category.', duplicateDishName:'This dish name already exists in the selected category.', multipleThumbnails:'Only one cover image is allowed.', imageUrlRequired:'Image URL is required.', imageUrlInvalid:'Use a valid HTTP/HTTPS image URL without spaces.', imageDuplicate:'This image URL has already been added.', pendingImage:'Add the entered image URL or clear it before saving.', saveError:'Could not confirm the save. Your input has been kept. Check your connection and retry.', validationTitle:'Please check your input', errorTitle:'Something went wrong', discardTitle:'Discard changes?', discardMessage:'Your unsaved changes will be lost.', discard:'Discard', keepEditing:'Keep editing'},
  vi: {brand:'Quản lý món ăn', heading:'Thực đơn ngon, quản lý gọn.', subtitle:'Món ngon mỗi ngày. Quản lý dễ dàng.', total:'Tổng số món', selling:'Đang bán', quickCount:'Món nhanh', search:'Tìm kiếm món ăn...', all:'Tất cả', filters:'Bộ lọc', reset:'Đặt lại', status:'Trạng thái', available:'Đang bán', unavailable:'Ngừng bán', min:'Giá thấp nhất', max:'Giá cao nhất', sort:'Sắp xếp', default:'Mặc định', priceAsc:'Giá: thấp đến cao', priceDesc:'Giá: cao đến thấp', timeAsc:'Chế biến: nhanh nhất', results:'Danh sách món', empty:'Không tìm thấy món ăn', emptyHint:'Thử từ khóa khác hoặc đặt lại bộ lọc.', loadError:'Không tải được dữ liệu. Hãy kiểm tra kết nối.', retry:'Thử lại', invalidPrice:'Giá phải là số không âm hợp lệ. Giá thấp nhất không được lớn hơn giá cao nhất.', quick:'Nhanh', regular:'Thông thường', minutes:'phút', noImage:'Chưa có ảnh', category:'Loại món', manageCategories:'Loại món ăn', unknownCategory:'Loại không tồn tại', preparation:'Thời gian chế biến', description:'Mô tả', noDescription:'Chưa có mô tả.', gallery:'Hình ảnh món ăn', close:'Đóng', details:'Chi tiết món ăn', removed:'Món ăn không còn tồn tại. Hãy tải lại danh sách.', delete:'Xóa món ăn', deleteTitle:'Xóa món ăn này?', deleteMessage:'Không thể hoàn tác thao tác này.', cancel:'Hủy', deleting:'Đang xóa...', deleteError:'Không xóa được. Hãy tải lại danh sách để kiểm tra trước khi thử lại.', add:'Thêm món', edit:'Chỉnh sửa món', name:'Tên món ăn', price:'Giá (VND)', time:'Thời gian chế biến (phút)', save:'Lưu món ăn', saving:'Đang lưu...', imageUrl:'Đường dẫn ảnh', addImage:'Thêm ảnh', removeImage:'Xóa ảnh', thumbnail:'Ảnh đại diện', setThumbnail:'Chọn làm đại diện', imageHint:'Thêm liên kết ảnh HTTP/HTTPS. Chọn tối đa một ảnh đại diện.', noCategories:'Chưa có loại món. Tạo loại trên MockAPI rồi tải lại.', formHint:'Nhập tên và mô tả gốc của món ăn.', nameRequired:'Tên món không được để trống.', priceInvalid:'Giá phải là số lớn hơn 0.', preparationTimeInvalid:'Thời gian chế biến phải là số lớn hơn 0.', categoryInvalid:'Hãy chọn loại món đang tồn tại.', duplicateDishName:'Tên món đã tồn tại trong loại đã chọn.', multipleThumbnails:'Chỉ được chọn một ảnh đại diện.', imageUrlRequired:'Không được để trống đường dẫn ảnh.', imageUrlInvalid:'Dùng URL ảnh HTTP/HTTPS hợp lệ, không có khoảng trắng.', imageDuplicate:'Đường dẫn ảnh này đã được thêm.', pendingImage:'Hãy thêm đường dẫn ảnh đang nhập hoặc xóa ô đó trước khi lưu.', saveError:'Chưa xác nhận được kết quả lưu. Dữ liệu nhập được giữ lại. Kiểm tra kết nối rồi thử lại.', validationTitle:'Kiểm tra dữ liệu', errorTitle:'Có lỗi xảy ra', discardTitle:'Bỏ thay đổi?', discardMessage:'Các thay đổi chưa lưu sẽ bị mất.', discard:'Bỏ thay đổi', keepEditing:'Tiếp tục sửa'},
};
type MessageKey = keyof typeof words.en;
const namesVi: Record<string,string> = {'Fried Rice':'Cơm chiên','Chicken Rice':'Cơm gà','Beef Pho':'Phở bò','Stir-fried Noodles':'Mì xào','Iced Coffee':'Cà phê đá'};
const categoriesVi: Record<string,string> = {Rice:'Cơm',Noodles:'Mì / Phở',Drinks:'Đồ uống'};
const descriptionsVi: Record<string,string> = {'Fried rice with eggs and vegetables.':'Cơm chiên với trứng và rau củ.','Rice served with chicken and vegetables.':'Cơm ăn kèm thịt gà và rau củ.','Vietnamese noodle soup with beef.':'Phở Việt Nam với thịt bò.','Stir-fried noodles with vegetables.':'Mì xào cùng rau củ.','Vietnamese coffee served with ice.':'Cà phê Việt Nam dùng với đá.'};
function translated(value:string, language:Language, dictionary:Record<string,string>):string {return language === 'vi' ? dictionary[value] ?? value : value;}
function normalize(value:string):string {return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[đĐ]/g,'d').trim().toLowerCase();}
function imagesOf(dish:ApiDish):DishImage[] {return Array.isArray(dish.BIT240168_DishImage) ? dish.BIT240168_DishImage : [];}
function validUrl(value:string):boolean {return /^https?:\/\/[^/\s?#]+(?:[/?#][^\s]*)?$/i.test(value);}
function newDraft(categoryId=''):Draft {return {businessId:`dish-${Date.now()}-${Math.random().toString(36).slice(2,10)}`,name:'',price:'',preparationTime:'',categoryId,available:true,description:'',images:[]};}

function Photo({uri,label,large=false}:{uri?:string;label:string;large?:boolean}):React.JSX.Element {
  const [failed,setFailed] = useState(false);
  useEffect(() => {setFailed(false);},[uri]);
  const size = large ? s.largePhoto : s.photo;
  return !uri || failed ? <View style={[size,s.photoFallback]}><Text style={s.foodIcon}>🍽️</Text><Text style={s.muted}>{label}</Text></View> : <Image source={{uri}} style={size} resizeMode="cover" onError={() => setFailed(true)} />;
}
function Chip({label,active,onPress,disabled=false}:{label:string;active:boolean;onPress:()=>void;disabled?:boolean}):React.JSX.Element {
  return <Pressable accessibilityRole="button" accessibilityState={{selected:active,disabled}} disabled={disabled} onPress={onPress} style={[s.chip,active && s.chipActive,disabled && s.disabled]}><Text style={[s.chipText,active && s.white]}>{label}</Text></Pressable>;
}
function Action({label,onPress,secondary=false,danger=false,disabled=false}:{label:string;onPress:()=>void;secondary?:boolean;danger?:boolean;disabled?:boolean}):React.JSX.Element {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[s.action,secondary && s.secondaryAction,danger && s.dangerAction,disabled && s.disabled]}><Text style={[s.actionText,secondary && s.secondaryText,danger && s.dangerText]}>{label}</Text></Pressable>;
}

export default function App():React.JSX.Element {
  const [language,setLanguage] = useState<Language>('en');
  const t = words[language];
  const [dishes,setDishes] = useState<ApiDish[]>([]);
  const [categories,setCategories] = useState<ApiDishCategory[]>([]);
  const [loading,setLoading] = useState(true);
  const [loadError,setLoadError] = useState(false);
  const loadingRef = useRef(false);
  const [search,setSearch] = useState('');
  const [categoryId,setCategoryId] = useState<string|null>(null);
  const [availability,setAvailability] = useState<Availability>('all');
  const [sortOrder,setSortOrder] = useState<SortOrder>('default');
  const [minPrice,setMinPrice] = useState('');
  const [maxPrice,setMaxPrice] = useState('');
  const [showFilters,setShowFilters] = useState(false);
  const [showCategories,setShowCategories] = useState(false);
  const [screen,setScreen] = useState<Screen>(null);
  const [selectedId,setSelectedId] = useState<string|null>(null);
  const [editingId,setEditingId] = useState<string|null>(null);
  const [draft,setDraft] = useState<Draft>(() => newDraft());
  const [imageUrl,setImageUrl] = useState('');
  const [dirty,setDirty] = useState(false);
  const [formErrors,setFormErrors] = useState<string[]>([]);
  const [busy,setBusy] = useState(false);
  const busyRef = useRef(false);
  const dialogRef = useRef(false);

  async function loadData():Promise<void> {
    if (loadingRef.current || busyRef.current) {return;}
    loadingRef.current=true; setLoading(true); setLoadError(false);
    try {
      const [nextCategories,nextDishes] = await Promise.all([getCategories(),getDishes()]);
      if (!Array.isArray(nextCategories) || !Array.isArray(nextDishes)) {throw new Error('Invalid response');}
      setCategories(nextCategories); setDishes(nextDishes);
      setCategoryId(current => current !== null && !nextCategories.some(item => item.BIT240168_Id === current) ? null : current);
    } catch {setLoadError(true);}
    finally {loadingRef.current=false; setLoading(false);}
  }
  useEffect(() => {void loadData();},[]);
  function text(key:string):string {return Object.prototype.hasOwnProperty.call(t,key) ? t[key as MessageKey] : t.errorTitle;}
  function dishName(dish:ApiDish):string {return translated(String(dish.BIT240168_Name ?? ''),language,namesVi);}
  function categoryName(id:string):string {const item=categories.find(value => value.BIT240168_Id === id); return item ? translated(item.BIT240168_Name,language,categoriesVi) : t.unknownCategory;}
  function money(value:number):string {const amount=Number(value); return Number.isFinite(amount) ? `${amount.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')} ₫` : '—';}
  function quick(dish:ApiDish):boolean {const time=Number(dish.BIT240168_PreparationTime);return Number.isFinite(time) && time>0 && time<=15;}
  function patchDraft(patch:Partial<Draft>):void {setDraft(current => ({...current,...patch}));setDirty(true);setFormErrors([]);}
  function resetFilters():void {setSearch('');setCategoryId(null);setAvailability('all');setSortOrder('default');setMinPrice('');setMaxPrice('');}
  function openCreate():void {
    if (loadingRef.current || busyRef.current) {return;}
    if (!categories.length) {Alert.alert(t.errorTitle,t.noCategories);return;}
    setEditingId(null);setSelectedId(null);setDraft(newDraft(categories[0].BIT240168_Id));setImageUrl('');setFormErrors([]);setDirty(false);setScreen('form');
  }
  function openEdit(dish:ApiDish):void {
    if (loadingRef.current || busyRef.current) {return;}
    let found=false;
    const images=imagesOf(dish).map(image => {const cover=Boolean(image.BIT240168_IsThumbnail) && !found;if(cover){found=true;}return {...image,BIT240168_IsThumbnail:cover};});
    setEditingId(dish.id);setDraft({businessId:dish.BIT240168_Id,name:dish.BIT240168_Name,price:String(dish.BIT240168_Price),preparationTime:String(dish.BIT240168_PreparationTime),categoryId:dish.BIT240168_DishCategoryId,available:dish.BIT240168_IsAvailable,description:dish.BIT240168_Description ?? '',images});
    setImageUrl('');setFormErrors([]);setDirty(false);setScreen('form');
  }
  function leaveModal():void {
    if (busyRef.current || dialogRef.current) {return;}
    const leave=()=>{if(screen==='form' && editingId && selectedId){setScreen('detail');}else{setScreen(null);setSelectedId(null);}setDirty(false);setFormErrors([]);setImageUrl('');};
    if(screen==='form' && dirty){
      dialogRef.current=true;
      Alert.alert(t.discardTitle,t.discardMessage,[{text:t.keepEditing,style:'cancel',onPress:()=>{dialogRef.current=false;}},{text:t.discard,style:'destructive',onPress:()=>{dialogRef.current=false;leave();}}],{cancelable:true,onDismiss:()=>{dialogRef.current=false;}});
    }else{leave();}
  }
  function addImage():void {
    const url=imageUrl.trim();
    if(!url || !validUrl(url)){setFormErrors([url ? 'imageUrlInvalid' : 'imageUrlRequired']);return;}
    if(draft.images.some(image => image.BIT240168_ImageUrl===url)){setFormErrors(['imageDuplicate']);return;}
    patchDraft({images:[...draft.images,{BIT240168_ImageUrl:url,BIT240168_IsThumbnail:draft.images.length===0}]});setImageUrl('');
  }
  function chooseThumbnail(index:number):void {patchDraft({images:draft.images.map((image,i)=>({...image,BIT240168_IsThumbnail:i===index}))});}
  function removeImage(index:number):void {
    const images=draft.images.filter((_,i)=>i!==index);
    if(images.length && !images.some(image=>image.BIT240168_IsThumbnail)){images[0]={...images[0],BIT240168_IsThumbnail:true};}
    patchDraft({images});
  }
  async function saveDish():Promise<void> {
    if(busyRef.current || loadingRef.current){return;}
    const payload: Dish={BIT240168_Id:draft.businessId,BIT240168_Name:draft.name.trim(),BIT240168_Price:Number(draft.price),BIT240168_PreparationTime:Number(draft.preparationTime),BIT240168_IsAvailable:draft.available,BIT240168_Description:draft.description.trim(),BIT240168_DishCategoryId:draft.categoryId,BIT240168_DishImage:draft.images.map(image=>({...image,BIT240168_ImageUrl:image.BIT240168_ImageUrl.trim()}))};
    const errors=Object.values(validateDish(payload,dishes,categories)).filter((value):value is string=>Boolean(value));
    if(imageUrl.trim()){errors.push('pendingImage');}
    if(payload.BIT240168_DishImage.some(image=>!validUrl(image.BIT240168_ImageUrl))){errors.push('imageUrlInvalid');}
    if(errors.length){setFormErrors([...new Set(errors)]);return;}
    busyRef.current=true;setBusy(true);setFormErrors([]);
    try {
      const [latestCategories,latestDishes]=await Promise.all([getCategories(),getDishes()]);
      if(!Array.isArray(latestCategories)||!Array.isArray(latestDishes)){throw new Error('Invalid response');}
      setCategories(latestCategories);setDishes(latestDishes);
      if(editingId && !latestDishes.some(dish=>dish.id===editingId)){setFormErrors(['removed']);return;}
      const latestErrors=Object.values(validateDish(payload,latestDishes,latestCategories)).filter((value):value is string=>Boolean(value));
      if(latestErrors.length){setFormErrors([...new Set(latestErrors)]);return;}
      const existing=!editingId ? latestDishes.find(dish=>dish.BIT240168_Id===payload.BIT240168_Id) : undefined;
      const target=editingId ?? existing?.id;
      const saved=target ? await updateDish(target,payload) : await createDish(payload);
      if(!saved?.id){throw new Error('Invalid saved record');}
      setDishes(current=>{const index=current.findIndex(dish=>dish.id===saved.id);if(index<0){return [...current,saved];}return current.map(dish=>dish.id===saved.id?saved:dish);});
      setDirty(false);setImageUrl('');setFormErrors([]);setSelectedId(saved.id);setScreen('detail');
    } catch(error:unknown){setFormErrors([axios.isAxiosError(error) && error.response?.status===404 && editingId ? 'removed':'saveError']);}
    finally{busyRef.current=false;setBusy(false);}
  }
  function confirmDelete(dish:ApiDish):void {
    if(busyRef.current || loadingRef.current || dialogRef.current){return;}
    dialogRef.current=true;
    Alert.alert(t.deleteTitle,`${dishName(dish)}\n\n${t.deleteMessage}`,[{text:t.cancel,style:'cancel',onPress:()=>{dialogRef.current=false;}},{text:t.delete,style:'destructive',onPress:()=>{dialogRef.current=false;void performDelete(dish.id);}}],{cancelable:true,onDismiss:()=>{dialogRef.current=false;}});
  }
  async function performDelete(id:string):Promise<void> {
    if(busyRef.current || loadingRef.current){return;}
    busyRef.current=true;setBusy(true);
    const remove=()=>{setDishes(current=>current.filter(dish=>dish.id!==id));setSelectedId(null);setScreen(null);};
    try{await deleteDish(id);remove();}
    catch(error:unknown){if(axios.isAxiosError(error)&&error.response?.status===404){remove();}else{Alert.alert(t.errorTitle,t.deleteError);}}
    finally{busyRef.current=false;setBusy(false);}
  }

  const minimum=minPrice.trim()==='' ? 0:Number(minPrice);
  const maximum=maxPrice.trim()==='' ? Infinity:Number(maxPrice);
  const invalidPrice=!Number.isFinite(minimum)||minimum<0||(maxPrice.trim()!==''&&!Number.isFinite(maximum))||maximum<0||minimum>maximum;
  const keyword=normalize(search);
  const visibleDishes=invalidPrice?[]:dishes.filter(dish=>{
    const name=String(dish.BIT240168_Name ?? '');const price=Number(dish.BIT240168_Price);
    return (normalize(name).includes(keyword)||normalize(namesVi[name]??name).includes(keyword)) && (categoryId===null||dish.BIT240168_DishCategoryId===categoryId) && (availability==='all'||(availability==='available'?dish.BIT240168_IsAvailable===true:dish.BIT240168_IsAvailable===false)) && Number.isFinite(price)&&price>=minimum&&price<=maximum;
  }).sort((a,b)=>sortOrder==='priceAsc'?Number(a.BIT240168_Price)-Number(b.BIT240168_Price):sortOrder==='priceDesc'?Number(b.BIT240168_Price)-Number(a.BIT240168_Price):sortOrder==='timeAsc'?Number(a.BIT240168_PreparationTime)-Number(b.BIT240168_PreparationTime):0);
  const selected=dishes.find(dish=>dish.id===selectedId);
  const statuses:Availability[]=['all','available','unavailable'];
  const sorts:SortOrder[]=['default','priceAsc','priceDesc','timeAsc'];
  const filterCount=Number(categoryId!==null)+Number(availability!=='all')+Number(minPrice.trim()!==''||maxPrice.trim()!=='');

  const header=(<View>
    <View style={s.topBar}><View style={s.brandRow}><View style={s.logo}><Text style={s.logoText}>F</Text></View><View style={s.brandInfo}><Text style={s.brand}>{t.brand}</Text><Text style={s.student}>BIT240168</Text></View></View><View style={s.languageSwitch}>{(['en','vi'] as Language[]).map(value=><Pressable key={value} onPress={()=>setLanguage(value)} style={[s.languageButton,language===value&&s.languageActive]}><Text style={[s.languageText,language===value&&s.orangeText]}>{value.toUpperCase()}</Text></Pressable>)}</View></View>
    <View style={s.hero}><Text style={s.eyebrow}>FOOD MANAGER</Text><Text style={s.heroTitle}>{t.heading}</Text><Text style={s.heroSubtitle}>{t.subtitle}</Text><Text style={s.heroStudent}>Nguyễn Hà Trung Nam · BIT240168</Text></View>
    <View style={s.stats}>{[{value:dishes.length,label:t.total},{value:dishes.filter(dish=>dish.BIT240168_IsAvailable===true).length,label:t.selling},{value:dishes.filter(quick).length,label:t.quickCount}].map(item=><View key={item.label} style={s.statCard}><Text style={s.statValue}>{item.value}</Text><Text style={s.statLabel}>{item.label}</Text></View>)}</View>
    <Action label={`+ ${t.add}`} onPress={openCreate} disabled={loading}/>
    <Action label={t.manageCategories} secondary disabled={loading||busy} onPress={()=>{if(!loadingRef.current&&!busyRef.current){setShowCategories(true);}}}/>
    <View style={s.searchBox}><Text style={s.searchIcon}>⌕</Text><TextInput value={search} onChangeText={setSearch} placeholder={t.search} placeholderTextColor="#9a8b7f" style={s.searchInput} autoCorrect={false} autoCapitalize="none"/>{!!search&&<Pressable onPress={()=>setSearch('')}><Text style={s.clear}>×</Text></Pressable>}</View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontalRow}><Chip label={t.all} active={categoryId===null} onPress={()=>setCategoryId(null)}/>{categories.map(category=><Chip key={category.id} label={translated(category.BIT240168_Name,language,categoriesVi)} active={categoryId===category.BIT240168_Id} onPress={()=>setCategoryId(category.BIT240168_Id)}/>)}</ScrollView>
    <View style={s.toolbar}><Chip label={`${t.filters}${filterCount?` (${filterCount})`:''}`} active={showFilters} onPress={()=>setShowFilters(value=>!value)}/><Pressable onPress={resetFilters}><Text style={s.link}>{t.reset}</Text></Pressable></View>
    {showFilters&&<View style={s.panel}><Text style={s.label}>{t.status}</Text><View style={s.wrap}>{statuses.map(value=><Chip key={value} label={t[value]} active={availability===value} onPress={()=>setAvailability(value)}/>)}</View><View style={s.row}><View style={s.flex}><Text style={s.label}>{t.min}</Text><TextInput value={minPrice} onChangeText={setMinPrice} keyboardType="numeric" placeholder="0" placeholderTextColor="#9a8b7f" style={s.input}/></View><View style={s.flex}><Text style={s.label}>{t.max}</Text><TextInput value={maxPrice} onChangeText={setMaxPrice} keyboardType="numeric" placeholder="..." placeholderTextColor="#9a8b7f" style={s.input}/></View></View></View>}
    <Text style={s.label}>{t.sort}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontalRow}>{sorts.map(value=><Chip key={value} label={t[value]} active={sortOrder===value} onPress={()=>setSortOrder(value)}/>)}</ScrollView>
    {invalidPrice&&<View style={s.errorBox}><Text style={s.errorText}>{t.invalidPrice}</Text></View>}
    {loadError&&<View style={s.errorBox}><Text style={s.errorText}>{t.loadError}</Text><Pressable disabled={loading} onPress={()=>void loadData()}><Text style={s.link}>{t.retry}</Text></Pressable></View>}
    <View style={s.resultRow}><Text style={s.sectionTitle}>{t.results}</Text><Text style={s.resultCount}>{visibleDishes.length}</Text></View>
  </View>);

  function renderDish({item}:{item:ApiDish}):React.JSX.Element {
    const images=imagesOf(item);const cover=images.find(image=>image.BIT240168_IsThumbnail)??images[0];
    return <Pressable accessibilityRole="button" onPress={()=>{setSelectedId(item.id);setScreen('detail');}} style={({pressed})=>[s.card,pressed&&s.pressed]}><Photo uri={cover?.BIT240168_ImageUrl} label={t.noImage}/><View style={s.cardContent}><Text style={s.categoryText} numberOfLines={1}>{categoryName(item.BIT240168_DishCategoryId)}</Text><Text style={s.dishName} numberOfLines={2}>{dishName(item)}</Text><Text style={s.price}>{money(item.BIT240168_Price)}</Text><Text style={s.meta}>{item.BIT240168_PreparationTime} {t.minutes} · {quick(item)?t.quick:t.regular}</Text><View style={[s.badge,item.BIT240168_IsAvailable?s.greenBadge:s.redBadge]}><Text style={[s.badgeText,item.BIT240168_IsAvailable?s.greenText:s.dangerText]}>{item.BIT240168_IsAvailable?t.available:t.unavailable}</Text></View></View><Text style={s.arrow}>›</Text></Pressable>;
  }
  return <SafeAreaProvider><SafeAreaView style={s.screen}>
    <StatusBar barStyle="dark-content" backgroundColor="#fffaf5"/>
    <FlatList data={visibleDishes} keyExtractor={item=>item.id} renderItem={renderDish} ListHeaderComponent={header} contentContainerStyle={s.page} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" refreshing={loading} onRefresh={()=>void loadData()} ListEmptyComponent={loading?<ActivityIndicator size="large" color="#ed7034" style={s.loading}/>:!loadError&&!invalidPrice?<View style={s.emptyBox}><Text style={s.foodIcon}>🍽️</Text><Text style={s.emptyTitle}>{t.empty}</Text><Text style={s.emptyHint}>{t.emptyHint}</Text></View>:null}/>
    <CategoryManager visible={showCategories} language={language} onClose={()=>{setShowCategories(false);void loadData();}} onChanged={()=>{void loadData();}}/>
    <Modal visible={screen!==null} animationType="slide" onRequestClose={leaveModal}>
      <SafeAreaView style={s.screen}>
        <View style={s.modalHeader}><Pressable disabled={busy} onPress={leaveModal} style={s.closeButton}><Text style={s.link}>‹ {t.close}</Text></Pressable><Text style={s.modalTitle}>{screen==='form'?(editingId?t.edit:t.add):t.details}</Text><Pressable disabled={busy} onPress={()=>setLanguage(value=>value==='en'?'vi':'en')}><Text style={s.link}>{language==='en'?'VI':'EN'}</Text></Pressable></View>
        {screen==='detail'&&(selected?<ScrollView contentContainerStyle={s.detailPage} showsVerticalScrollIndicator={false}>
          <Text style={s.categoryText}>{categoryName(selected.BIT240168_DishCategoryId)}</Text><Text style={s.detailTitle}>{dishName(selected)}</Text><Text style={s.detailPrice}>{money(selected.BIT240168_Price)}</Text>
          <View style={s.facts}><View style={s.fact}><Text style={s.muted}>{t.preparation}</Text><Text style={s.factValue}>{selected.BIT240168_PreparationTime} {t.minutes}</Text><Text style={s.muted}>{quick(selected)?t.quick:t.regular}</Text></View><View style={s.fact}><Text style={s.muted}>{t.status}</Text><Text style={s.factValue}>{selected.BIT240168_IsAvailable?t.available:t.unavailable}</Text></View></View>
          <Text style={s.sectionTitle}>{t.gallery}</Text><View style={s.sectionGap}>{imagesOf(selected).length?[...imagesOf(selected)].sort((a,b)=>Number(b.BIT240168_IsThumbnail)-Number(a.BIT240168_IsThumbnail)).map((image,index)=><Photo key={`${index}-${image.BIT240168_ImageUrl}`} uri={image.BIT240168_ImageUrl} label={t.noImage} large/>):<Photo label={t.noImage} large/>}</View>
          <Text style={s.sectionTitle}>{t.description}</Text><Text style={s.description}>{selected.BIT240168_Description?translated(selected.BIT240168_Description,language,descriptionsVi):t.noDescription}</Text>
          <Action label={t.edit} onPress={()=>openEdit(selected)} disabled={busy||loading}/><Action label={busy?t.deleting:t.delete} onPress={()=>confirmDelete(selected)} danger disabled={busy||loading}/>
        </ScrollView>:<View style={s.emptyBox}><Text style={s.emptyTitle}>{t.removed}</Text></View>)}
        {screen==='form'&&<KeyboardAvoidingView style={s.flex} behavior={Platform.OS==='ios'?'padding':undefined}><ScrollView contentContainerStyle={s.detailPage} keyboardShouldPersistTaps="handled">
          <Text style={s.formHint}>{t.formHint}</Text><Text style={s.label}>{t.name}</Text><TextInput value={draft.name} onChangeText={name=>patchDraft({name})} editable={!busy} style={s.input} maxLength={150}/>
          <View style={s.formRow}><View style={s.flex}><Text style={s.label}>{t.price}</Text><TextInput value={draft.price} onChangeText={price=>patchDraft({price})} editable={!busy} keyboardType="numeric" style={s.input}/></View><View style={s.flex}><Text style={s.label}>{t.time}</Text><TextInput value={draft.preparationTime} onChangeText={preparationTime=>patchDraft({preparationTime})} editable={!busy} keyboardType="numeric" style={s.input}/></View></View>
          <Text style={s.formLabel}>{t.category}</Text>{categories.length?<View style={s.wrap}>{categories.map(category=><Chip key={category.id} label={translated(category.BIT240168_Name,language,categoriesVi)} active={draft.categoryId===category.BIT240168_Id} disabled={busy} onPress={()=>patchDraft({categoryId:category.BIT240168_Id})}/>)}</View>:<Text style={s.errorText}>{t.noCategories}</Text>}
          <View style={s.switchRow}><View style={s.flex}><Text style={s.sectionTitle}>{t.status}</Text><Text style={s.muted}>{draft.available?t.available:t.unavailable}</Text></View><Switch value={draft.available} disabled={busy} onValueChange={available=>patchDraft({available})} trackColor={{false:'#dfd5cc',true:'#efad87'}} thumbColor={draft.available?'#ed7034':'#ffffff'}/></View>
          <Text style={s.formLabel}>{t.description}</Text><TextInput value={draft.description} onChangeText={description=>patchDraft({description})} editable={!busy} style={[s.input,s.multiline]} multiline textAlignVertical="top"/>
          <Text style={s.formLabel}>{t.gallery}</Text><Text style={s.formHint}>{t.imageHint}</Text><TextInput value={imageUrl} onChangeText={value=>{setImageUrl(value);setDirty(true);setFormErrors([]);}} editable={!busy} placeholder="https://..." placeholderTextColor="#9a8b7f" autoCapitalize="none" autoCorrect={false} keyboardType="url" style={s.input}/><Action label={`+ ${t.addImage}`} onPress={addImage} secondary disabled={busy}/>
          {draft.images.map((image,index)=><View key={`${index}-${image.BIT240168_ImageUrl}`} style={s.imageCard}><Photo uri={image.BIT240168_ImageUrl} label={t.noImage} large/><Text style={s.imageUrlText}>{image.BIT240168_ImageUrl}</Text><Chip label={image.BIT240168_IsThumbnail?`✓ ${t.thumbnail}`:t.setThumbnail} active={image.BIT240168_IsThumbnail} disabled={busy} onPress={()=>chooseThumbnail(index)}/><Pressable disabled={busy} onPress={()=>removeImage(index)}><Text style={s.removeText}>{t.removeImage}</Text></Pressable></View>)}
          {!!formErrors.length&&<View style={s.errorBox}><Text style={s.errorHeading}>{t.validationTitle}</Text>{formErrors.map(key=><Text key={key} style={s.errorText}>• {text(key)}</Text>)}</View>}
          {busy&&<ActivityIndicator color="#ed7034" style={s.sectionGap}/>}<Action label={busy?t.saving:t.save} onPress={()=>void saveDish()} disabled={busy||!categories.length}/><Action label={t.cancel} onPress={leaveModal} secondary disabled={busy}/>
        </ScrollView></KeyboardAvoidingView>}
      </SafeAreaView>
    </Modal>
  </SafeAreaView></SafeAreaProvider>;
}

const s=StyleSheet.create({
  screen:{flex:1,backgroundColor:'#fffaf5'},flex:{flex:1},page:{padding:20,paddingBottom:35},topBar:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:22},brandRow:{flexDirection:'row',alignItems:'center',flex:1,marginRight:8},logo:{width:42,height:42,borderRadius:14,backgroundColor:'#ed7034',alignItems:'center',justifyContent:'center'},logoText:{fontSize:26,fontWeight:'900',color:'#ffffff'},brandInfo:{flex:1,marginLeft:10},brand:{fontSize:17,fontWeight:'800',color:'#352a24'},student:{marginTop:3,fontSize:11,color:'#9a8b7f',letterSpacing:1},languageSwitch:{flexDirection:'row',padding:4,borderRadius:12,backgroundColor:'#f3e9df'},languageButton:{paddingHorizontal:11,paddingVertical:8,borderRadius:9},languageActive:{backgroundColor:'#ffffff',elevation:1},languageText:{fontSize:12,fontWeight:'700',color:'#9a8b7f'},orangeText:{color:'#d95d25'},hero:{padding:22,borderRadius:24,backgroundColor:'#fce8d7',marginBottom:16},eyebrow:{fontSize:10,fontWeight:'800',letterSpacing:3,color:'#ba5a2d'},heroTitle:{marginTop:12,fontSize:29,lineHeight:36,fontWeight:'900',color:'#543220'},heroSubtitle:{marginTop:10,fontSize:13,lineHeight:20,color:'#936d52'},heroStudent:{marginTop:18,fontSize:11,color:'#986d4e'},stats:{flexDirection:'row',gap:10,marginBottom:18},statCard:{flex:1,paddingVertical:15,paddingHorizontal:5,borderRadius:16,borderWidth:1,borderColor:'#f2e8df',backgroundColor:'#ffffff',alignItems:'center'},statValue:{fontSize:25,fontWeight:'800',color:'#d9652c'},statLabel:{marginTop:5,fontSize:11,color:'#8c7c70',textAlign:'center'},
  action:{minHeight:48,padding:14,borderRadius:14,backgroundColor:'#ed7034',alignItems:'center',justifyContent:'center',marginBottom:12},actionText:{fontSize:14,fontWeight:'800',color:'#ffffff'},secondaryAction:{backgroundColor:'#faeddf',borderWidth:1,borderColor:'#ecd9c8'},secondaryText:{color:'#a4552e'},dangerAction:{backgroundColor:'#fff0eb',borderWidth:1,borderColor:'#efc7be'},dangerText:{color:'#b64738'},disabled:{opacity:0.5},searchBox:{flexDirection:'row',alignItems:'center',backgroundColor:'#ffffff',borderWidth:1,borderColor:'#efe3d8',borderRadius:16,paddingHorizontal:14,marginBottom:15},searchIcon:{fontSize:29,color:'#be9c83',marginRight:10},searchInput:{flex:1,minHeight:50,color:'#352a24',fontSize:14},clear:{fontSize:26,paddingLeft:12,color:'#9a8b7f'},horizontalRow:{gap:8,paddingBottom:15},chip:{paddingHorizontal:14,paddingVertical:10,borderRadius:22,backgroundColor:'#ffffff',borderWidth:1,borderColor:'#eddfd3',alignSelf:'flex-start'},chipActive:{backgroundColor:'#ed7034',borderColor:'#ed7034'},chipText:{color:'#8b7565',fontSize:12,fontWeight:'600'},white:{color:'#ffffff'},toolbar:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:16},link:{color:'#d9652c',fontSize:13,fontWeight:'700',padding:5},panel:{backgroundColor:'#fff1e5',borderRadius:18,padding:14,marginBottom:18},label:{fontSize:12,fontWeight:'700',color:'#846d5b',marginBottom:9},formLabel:{fontSize:13,fontWeight:'700',color:'#846d5b',marginTop:18,marginBottom:9},wrap:{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:10},row:{flexDirection:'row',gap:12},formRow:{flexDirection:'row',gap:12,marginTop:18},input:{borderWidth:1,borderColor:'#ecd9c8',backgroundColor:'#ffffff',borderRadius:12,paddingHorizontal:13,paddingVertical:12,minHeight:46,color:'#352a24',fontSize:14},multiline:{minHeight:110},errorBox:{padding:14,borderRadius:14,backgroundColor:'#fee9e4',marginVertical:12},errorHeading:{color:'#a44235',fontWeight:'800',marginBottom:6},errorText:{color:'#a44235',fontSize:13,lineHeight:21},resultRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:14},sectionTitle:{fontSize:19,fontWeight:'800',color:'#352a24'},resultCount:{fontSize:12,fontWeight:'700',color:'#ad7954',backgroundColor:'#f5e6d9',paddingHorizontal:11,paddingVertical:5,borderRadius:12},
  card:{flexDirection:'row',alignItems:'center',padding:12,marginBottom:14,borderRadius:20,backgroundColor:'#ffffff',borderWidth:1,borderColor:'#f1e6dc',elevation:2,shadowColor:'#9d6745',shadowOffset:{width:0,height:3},shadowOpacity:0.07,shadowRadius:8},pressed:{opacity:0.75},photo:{width:100,height:135,borderRadius:15,backgroundColor:'#f8eee4'},largePhoto:{width:'100%',height:225,borderRadius:18,marginBottom:14,backgroundColor:'#f8eee4'},photoFallback:{justifyContent:'center',alignItems:'center',padding:8},foodIcon:{fontSize:35,marginBottom:8},muted:{color:'#9a8b7f',fontSize:12,lineHeight:19},cardContent:{flex:1,marginLeft:13},categoryText:{fontSize:11,fontWeight:'700',color:'#b68a65',marginBottom:5},dishName:{fontSize:17,lineHeight:23,fontWeight:'800',color:'#352a24'},price:{fontSize:18,fontWeight:'800',color:'#df6a30',marginTop:7},meta:{marginTop:6,fontSize:11,color:'#9a8b7f'},badge:{alignSelf:'flex-start',borderRadius:7,paddingHorizontal:7,paddingVertical:4,marginTop:8},greenBadge:{backgroundColor:'#e9f5ec'},redBadge:{backgroundColor:'#fcece8'},badgeText:{fontSize:10,fontWeight:'700'},greenText:{color:'#22734d'},arrow:{fontSize:26,color:'#cfb6a1',marginLeft:5},loading:{marginVertical:35},emptyBox:{paddingVertical:45,paddingHorizontal:20,alignItems:'center'},emptyTitle:{fontSize:18,color:'#6f5542',fontWeight:'700',textAlign:'center'},emptyHint:{marginTop:8,fontSize:13,lineHeight:20,color:'#9a8b7f',textAlign:'center'},modalHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',padding:14,borderBottomWidth:1,borderBottomColor:'#f0e4d9'},closeButton:{paddingVertical:5},modalTitle:{flex:1,textAlign:'center',fontSize:16,fontWeight:'800',color:'#543220'},detailPage:{padding:22,paddingBottom:45},detailTitle:{fontSize:30,lineHeight:38,fontWeight:'900',color:'#352a24'},detailPrice:{marginTop:12,color:'#df6a30',fontSize:27,fontWeight:'800'},facts:{flexDirection:'row',gap:12,marginVertical:22},fact:{flex:1,padding:15,borderRadius:16,backgroundColor:'#faeddf'},factValue:{fontSize:17,fontWeight:'800',color:'#543220',marginVertical:6},sectionGap:{marginVertical:14},description:{marginTop:12,marginBottom:24,color:'#8b7565',fontSize:15,lineHeight:25},formHint:{color:'#9a8b7f',fontSize:12,lineHeight:20,marginBottom:15},switchRow:{flexDirection:'row',alignItems:'center',backgroundColor:'#faeddf',padding:15,borderRadius:15,marginTop:10},imageCard:{padding:12,backgroundColor:'#ffffff',borderRadius:18,borderWidth:1,borderColor:'#efdfd1',marginBottom:14},imageUrlText:{color:'#9a8b7f',fontSize:11,lineHeight:17,marginBottom:12},removeText:{color:'#b64738',fontSize:13,fontWeight:'700',paddingVertical:12},
});
