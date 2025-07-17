// Map.tsx
import React, { useRef, useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
  Alert,
  Keyboard,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { GOOGLE_API_KEY } from '@env';

interface SearchHistoryItem {
  id: number;
  keyword: string;
}
interface AnimalInfo {
  name: string;
  english: string;
  image_url: string;
  features: string[];
  precautions: string[];
}
interface PlaceItem {
  id: string;
  type: string;
  location: string;
  lat: number;
  lng: number;
}

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const BACKEND_URL = 'http://10.0.2.2:8000/api';

export default function Map() {
  // BottomSheet, MapView, 애니메이션 등 ref/state 준비
  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);
  const snapPoints = useMemo(
    () => [windowHeight * 0.33, windowHeight * 0.75],
    [],
  );
  const animatedPosition = useSharedValue(0);

  // 탭, 검색창, 기록, 동물 정보, 장소 리스트
  const [tab, setTab] = useState<'장소' | '정보'>('장소');
  const [input, setInput] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [animalInfo, setAnimalInfo] = useState<AnimalInfo | null>(null);
  const [savedPlaces, setSavedPlaces] = useState<PlaceItem[]>([
    {
      id: 'init1',
      type: '카페',
      location: '서울특별시 중구 을지로 100',
      lat: 37.5665,
      lng: 126.978,
    },
    {
      id: 'init2',
      type: '공원',
      location: '서울특별시 성동구 왕십리로 20',
      lat: 37.5635,
      lng: 127.036,
    },
  ]);
  const [region, setRegion] = useState({
    latitude: savedPlaces[0].lat,
    longitude: savedPlaces[0].lng,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // 애니메이션
  const bannerAnimatedStyle = useAnimatedStyle(() => {
    const bannerHeight = 54,
      extraMargin = 20;
    const top = interpolate(
      animatedPosition.value,
      [snapPoints[1], snapPoints[0]],
      [
        snapPoints[1] - bannerHeight - extraMargin,
        snapPoints[0] - bannerHeight - extraMargin,
      ],
      Extrapolate.CLAMP,
    );
    return { top };
  });

  // 중복 기록 제거
  function getUniqueHistory(historyArr: SearchHistoryItem[]) {
    const seen = new Set<string>();
    return historyArr.filter(item => {
      if (seen.has(item.keyword)) return false;
      seen.add(item.keyword);
      return true;
    });
  }

  // 기록 불러오기
  useEffect(() => {
    fetchHistory();
  }, []);
  useEffect(() => {
    if (savedPlaces.length > 0) {
      const last = savedPlaces[savedPlaces.length - 1];
      setRegion({
        latitude: last.lat,
        longitude: last.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [savedPlaces]);

  // 검색 기록 fetch
  async function fetchHistory() {
    try {
      const res = await fetch(`${BACKEND_URL}/search-history`);
      if (!res.ok) throw new Error('기록 조회 실패');
      const data: SearchHistoryItem[] = await res.json();
      setHistory(data);
    } catch (e) {
      setHistory([]);
    }
  }

  // 검색(동물 or 장소)
  async function handleSearch(keyword: string) {
    const animalList = [
      '고라니',
      '멧돼지',
      '청설모',
      '다람쥐',
      '너구리',
      '반달가슴곰',
      '노루',
      '멧토끼',
      '족제비',
      '왜가리',
      '중대백로',
    ];
    const trimmed = keyword.trim();
    const isAnimal = animalList.includes(trimmed);

    if (!trimmed) return;
    Keyboard.dismiss();
    if (isAnimal) {
      await searchAnimal(trimmed);
    } else {
      await searchPlace(trimmed);
    }
  }

  // 동물 검색
  async function searchAnimal(keyword: string) {
    const url = `${BACKEND_URL}/animal-info?name=${encodeURIComponent(
      keyword,
    )}`;
    try {
      const infoRes = await fetch(url);
      const infoData = await infoRes.json();

      if (!infoRes.ok || !infoData.name) throw new Error('정보 없음');
      setAnimalInfo(infoData);

      // 검색 기록 저장
      const unique = getUniqueHistory(history);
      if (!unique.find(h => h.keyword === keyword)) {
        await fetch(`${BACKEND_URL}/search-history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyword }),
        });
        fetchHistory();
      }
      setDropdownOpen(false);
      setSelectedId(null);
    } catch (e) {
      Alert.alert('검색 실패', '검색 결과를 불러오지 못했습니다.');
      setAnimalInfo(null);
    }
  }

  // 장소 검색
  async function searchPlace(keyword: string) {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
          keyword,
        )}&language=ko&key=${GOOGLE_API_KEY}`,
      );
      const data = await res.json();

      // console.log('장소검색 data:', data);

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        Alert.alert('에러', data.error_message || 'API 오류 발생');
        return;
      }

      if (data.results && data.results.length > 0) {
        const place = data.results[0];

        // 지도 이동
        mapRef.current?.animateToRegion(
          {
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000,
        );

        // 장소 저장
        setSavedPlaces(prev => {
          const already = prev.find(p => p.id === place.place_id);
          if (already) return prev;
          return [
            ...prev,
            {
              id: place.place_id,
              type: place.name,
              location: place.formatted_address,
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
            },
          ];
        });

        // 검색 기록 저장
        const unique = getUniqueHistory(history);
        if (!unique.find(h => h.keyword === keyword)) {
          await fetch(`${BACKEND_URL}/search-history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keyword }),
          });
          fetchHistory();
        }

        setDropdownOpen(false);
        setSelectedId(null);
        Alert.alert('장소가 저장되었습니다!');
      } else {
        Alert.alert('장소를 찾을 수 없습니다.');
      }
    } catch (e) {
      Alert.alert('검색 실패', '장소 검색에 실패했습니다.');
    }
  }

  // 기록 선택
  async function handleSelectHistory(id: number, keyword: string) {
    setInput(keyword);
    setSelectedId(id);
    setDropdownOpen(false);
    await handleSearch(keyword);
  }

  // 기록 삭제
  async function handleRemoveHistory(id: number) {
    try {
      await fetch(`${BACKEND_URL}/search-history/${id}`, { method: 'DELETE' });
      fetchHistory();
      if (selectedId === id) setSelectedId(null);
    } catch (e) {
      Alert.alert('삭제 실패', '검색 기록 삭제 중 오류');
    }
  }

  return (
    <View style={styles.container}>
      {/* 지도 */}
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
      >
        {savedPlaces.map(place => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.lat, longitude: place.lng }}
            title={place.type}
            description={place.location}
          />
        ))}
      </MapView>
      {/* 검색 바 */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={22}
            color="#bbb"
            style={{ marginRight: 6 }}
          />
          <TextInput
            style={styles.searchInput}
            value={input}
            onFocus={() => setDropdownOpen(true)}
            onChangeText={text => setInput(text)}
            onSubmitEditing={() => handleSearch(input)}
            placeholder="주소 및 야생 동물 검색"
            placeholderTextColor="#aaa"
          />
        </View>
        {/* 드롭다운 */}
        {dropdownOpen && (
          <View style={styles.dropdown}>
            <FlatList
              data={getUniqueHistory(history)}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item, index }) => {
                const uniqueHistory = getUniqueHistory(history);
                const isFirst = index === 0;
                const isLast = index === uniqueHistory.length - 1;
                const isCurrent = input.trim() === item.keyword;
                return (
                  <View
                    style={[
                      styles.dropdownItem,
                      isFirst && styles.dropdownItemFirst,
                      isLast && styles.dropdownItemLast,
                      isCurrent && styles.dropdownItemActive,
                    ]}
                  >
                    <Ionicons
                      name="time-outline"
                      size={18}
                      color="#bbb"
                      style={{ marginRight: 8 }}
                    />
                    <TouchableOpacity
                      style={{ flex: 1 }}
                      onPress={() => handleSelectHistory(item.id, item.keyword)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.dropdownText}>{item.keyword}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRemoveHistory(item.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      style={{ marginLeft: 8 }}
                    >
                      <Ionicons name="close" size={18} color="#bbb" />
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          </View>
        )}
      </View>
      {/* 오른쪽 버튼 그룹 */}
      <View style={styles.fabGroup}>
        <TouchableOpacity style={styles.fabButton}>
          <Image
            source={require('../../assets/images/logo2.png')}
            style={{ width: 41, height: 37, borderRadius: 14 }}
            resizeMode="cover"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.fabButton}>
          <MaterialIcons name="place" size={27} color="#DD0000" />
        </TouchableOpacity>
      </View>
      {/* 알림 배너 */}
      <Animated.View
        style={[
          styles.banner,
          bannerAnimatedStyle,
          { width: windowWidth - 16, left: 8, right: undefined },
        ]}
      >
        <Text style={styles.bannerText}>
          오후 9시 30분경 "##역" 반경 2KM 이내에 고라니 출현
        </Text>
      </Animated.View>
      {/* BottomSheet */}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        animatedPosition={animatedPosition}
        enablePanDownToClose={false}
        backgroundStyle={{
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: '#fff',
        }}
        handleIndicatorStyle={{ backgroundColor: '#ccc' }}
      >
        <BottomSheetView style={{ padding: 24, paddingTop: 6 }}>
          {/* 탭 */}
          <View style={styles.switchContainer}>
            <TouchableOpacity
              style={[
                styles.switchItem,
                tab === '장소' && styles.switchItemActive,
              ]}
              onPress={() => setTab('장소')}
              activeOpacity={0.9}
            >
              <Text
                style={[
                  styles.switchText,
                  tab === '장소' && styles.switchTextActive,
                ]}
              >
                장소
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.switchItem,
                tab === '정보' && styles.switchItemActive,
              ]}
              onPress={() => setTab('정보')}
              activeOpacity={0.9}
            >
              <Text
                style={[
                  styles.switchText,
                  tab === '정보' && styles.switchTextActive,
                ]}
              >
                정보
              </Text>
            </TouchableOpacity>
          </View>
          {/* 리스트 or 정보 내용 */}
          {tab === '장소' ? (
            <>
              <Text style={styles.sectionTitle}>전체 리스트</Text>
              <View style={styles.divider} />
              <FlatList
                data={savedPlaces}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <View style={styles.placeRow}>
                    <View style={styles.greenCircleSmall} />
                    <View style={{ marginLeft: 6 }}>
                      <Text style={styles.placeTitle}>{item.type}</Text>
                      <View style={styles.placeMetaRow}>
                        <MaterialIcons
                          name="place"
                          size={15}
                          color="#444"
                          style={{ marginRight: 2 }}
                        />
                        <Text style={styles.placeMetaText}>
                          {item.location}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              />
            </>
          ) : animalInfo ? (
            <View>
              <Text style={styles.animalTitle}>{animalInfo.name}</Text>
              <Text style={styles.animalSubtitle}>{animalInfo.english}</Text>
              <Image
                source={{ uri: animalInfo.image_url }}
                style={styles.animalImage}
                resizeMode="cover"
              />
              <Text style={styles.animalSectionTitle}>특징</Text>
              <View style={{ marginLeft: 8, marginBottom: 12 }}>
                {(animalInfo.features || []).map((txt: string, i: number) => (
                  <Text key={i} style={styles.animalFeature}>
                    • {txt}
                  </Text>
                ))}
              </View>
              <Text style={styles.animalSectionTitle}>대처법</Text>
              <View style={{ marginLeft: 8 }}>
                {(Array.isArray(animalInfo.precautions)
                  ? animalInfo.precautions
                  : []
                ).map((txt: string, i: number) => (
                  <Text key={i} style={styles.animalPrecaution}>
                    • {txt}
                  </Text>
                ))}
              </View>
            </View>
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>
              동물 이름을 검색하면 정보가 나옵니다.
            </Text>
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

// 아래 스타일 코드는 그대로 복사해서 사용하세요!
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f1ea' },
  map: { ...StyleSheet.absoluteFillObject },
  searchBarWrapper: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    zIndex: 30,
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#222' },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginTop: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    zIndex: 100,
    padding: 0,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderBottomWidth: 1,
    borderColor: '#f1f1f1',
    backgroundColor: '#fff',
  },
  dropdownItemFirst: { marginTop: 2 },
  dropdownItemLast: { borderBottomWidth: 0 },
  dropdownItemActive: { backgroundColor: '#faf7e9' },
  dropdownText: {
    fontSize: 17,
    color: '#444',
    fontWeight: 'bold',
  },
  fabGroup: { position: 'absolute', right: 18, top: 100, alignItems: 'center' },
  fabButton: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  switchContainer: {
    flexDirection: 'row',
    backgroundColor: '#faf7e9',
    borderRadius: 32,
    padding: 3,
    marginVertical: 2,
    marginBottom: 12,
  },
  switchItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    height: 59,
    paddingVertical: 9,
    backgroundColor: 'transparent',
  },
  switchItemActive: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FEBE10',
    borderRadius: 30,
  },
  switchText: {
    fontWeight: 'bold',
    fontSize: 21,
    color: '#222',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  switchTextActive: { color: '#222' },
  placeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  greenCircleSmall: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 5,
    borderColor: '#46771f',
    backgroundColor: '#fff',
  },
  placeTitle: { fontWeight: 'bold', fontSize: 16, color: '#222', marginTop: 3 },
  placeMetaRow: { flexDirection: 'row', alignItems: 'center' },
  placeMetaText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#444',
    marginLeft: 1,
  },
  banner: {
    position: 'absolute',
    left: 24,
    zIndex: 20,
    backgroundColor: '#FEBE10',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  bannerText: { color: '#222', fontWeight: 'bold', fontSize: 15 },
  sectionTitle: { fontWeight: 'bold', fontSize: 25, marginVertical: 8 },
  animalTitle: {
    fontWeight: 'bold',
    fontSize: 22,
    marginTop: 8,
    marginBottom: 2,
  },
  animalSubtitle: { color: '#666', fontSize: 15, marginBottom: 9 },
  animalImage: {
    width: '100%',
    height: 170,
    borderRadius: 14,
    backgroundColor: '#eee',
    marginBottom: 14,
    marginTop: 4,
  },
  animalSectionTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 6,
    marginBottom: 4,
    color: '#a58519',
  },
  animalFeature: { fontSize: 15, color: '#393939', marginBottom: 2 },
  animalPrecaution: { fontSize: 15, color: '#2f5d19', marginBottom: 2 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.8,
    borderBottomColor: '#eaeaea',
  },
  divider: {
    height: 1,
    backgroundColor: '#7B7B7B',
    marginVertical: 4,
    marginBottom: 0,
  },
});
