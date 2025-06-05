import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Dimensions,
  ListRenderItemInfo,
} from 'react-native';
import MapView from 'react-native-maps';
import Carousel from 'react-native-reanimated-carousel';

const screenWidth = Dimensions.get('window').width;

interface PlaceItem {
  title: string;
  description: string;
}

const exampleData: PlaceItem[] = [
  {title: '장소 1', description: '설명 1'},
  {title: '장소 2', description: '설명 2'},
  {title: '장소 3', description: '설명 3'},
];

const App = () => {
  const [currentTab, setCurrentTab] = useState<'info' | 'another'>('info');
  const carouselRef = useRef(null); // 가장 간단하고 안전한 방법
  //const carouselRef = useRef<Carousel<PlaceItem>>(null);

  // react-native-reanimated-carousel의 renderItem은 아래와 같이 받습니다
  const renderItem = ({item, index}: {item: PlaceItem; index: number}) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text>{item.description}</Text>
    </View>
  );

  const renderListItem = ({item}: ListRenderItemInfo<PlaceItem>) => (
    <View style={styles.listItem}>
      <Text>{item.title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 지도 */}
      {
        <MapView
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude: 37.5665,
            longitude: 126.978,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      }

      {/* 검색 바 */}
      <View style={styles.searchBar}>
        <TextInput placeholder="장소 검색" style={styles.input} />
      </View>

      {/* 하단 리스트 + 탭 영역 */}
      <View style={styles.bottomPanel}>
        <FlatList
          data={exampleData}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderListItem}
          horizontal
          showsHorizontalScrollIndicator={false}
        />

        {currentTab === 'info' ? <InfoComponent /> : <AnotherComponent />}
      </View>

      {/* 하단 캐러셀 */}
      <View style={styles.carouselContainer}>
        <Carousel
          ref={carouselRef}
          width={screenWidth * 0.8} // 아이템 너비
          height={150} // 아이템 높이
          data={exampleData}
          renderItem={renderItem}
          pagingEnabled // 스크롤이 한 아이템씩 움직이게
          mode="horizontal-stack" // 캐러셀 모드
          modeConfig={{snapDirection: 'left'}}
        />
      </View>
    </View>
  );
};

const InfoComponent = () => (
  <View style={styles.infoBox}>
    <Text>Info 탭 내용입니다</Text>
  </View>
);

const AnotherComponent = () => (
  <View style={styles.infoBox}>
    <Text>다른 탭 내용입니다</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {flex: 1},
  searchBar: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    zIndex: 10,
    elevation: 5,
  },
  input: {fontSize: 16},
  bottomPanel: {
    position: 'absolute',
    bottom: 140,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
  },
  listItem: {
    backgroundColor: '#fff',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    elevation: 2,
  },
  carouselContainer: {
    position: 'absolute',
    bottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoBox: {
    marginTop: 10,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
});

export default App;
