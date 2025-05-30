import React, {useState} from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Pressable,
  GestureResponderEvent,
} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import CheckBox from '@react-native-community/checkbox';
import Icon from 'react-native-vector-icons/FontAwesome';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';

type RootStackParamList = {
  Login: undefined;
  FindEmail: undefined;
  FindPassword: undefined;
  // 여기에 다른 네비게이션 스택 화면을 추가하세요
};

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

type LoginScreenRouteProp = RouteProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
  route?: LoginScreenRouteProp;
};

export default function Login({navigation}: Props) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isChecked, setIsChecked] = useState<boolean>(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('알림', '이메일과 비밀번호 모두 입력해주세요');
      return;
    }
    const mockUser = {
      email: 'user@example.com',
      password: 'password123',
    };

    if (email === mockUser.email && password === mockUser.password) {
      Alert.alert('로그인 성공', `환영합니다, ${email}님!`);
      // 로그인 성공 후 다음 화면 이동 코드 등 넣으시면 됩니다.
    } else {
      Alert.alert(
        '로그인 실패',
        '입력하신 이메일 또는 비밀번호가 일치하지 않습니다',
      );
    }
  };

  type LoginButtonProps = {
    iconName?: string;
    iconSource?: any;
    text: string;
    onPress: (event: GestureResponderEvent) => void;
  };

  const LoginButton = ({
    iconName,
    iconSource,
    text,
    onPress,
  }: LoginButtonProps) => {
    return (
      <TouchableOpacity
        style={styles.snsButton}
        onPress={onPress}
        activeOpacity={0.7}>
        {iconSource ? (
          <Image source={iconSource} style={styles.snsIconImage} />
        ) : (
          <Icon
            name={iconName || 'question'}
            size={24}
            color="#000"
            style={styles.snsIcon}
          />
        )}
        <Text style={styles.snsButtonText}>{text}</Text>
      </TouchableOpacity>
    );
  };

  const handleGoogleLogin = () => {
    Alert.alert(
      '알림',
      'SENCITY에서 Google을 열려고 합니다',
      [
        {text: '취소', style: 'cancel'},
        {text: '확인', onPress: () => console.log('Google 로그인')},
      ],
      {cancelable: true},
    );
  };

  const handleNaver = () => {
    Alert.alert(
      '알림',
      'SENCITY에서 Naver을 열려고 합니다',
      [
        {text: '취소', style: 'cancel'},
        {text: '확인', onPress: () => console.log('Naver 로그인')},
      ],
      {cancelable: true},
    );
  };

  const handleFacebookLogin = () => {
    Alert.alert(
      '알림',
      'SENCITY에서 Facebook을 열려고 합니다',
      [
        {text: '취소', style: 'cancel'},
        {text: '확인', onPress: () => console.log('Facebook 로그인')},
      ],
      {cancelable: true},
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.title, {lineHeight: 38}]}>
            SENCITY{'\n'}로그인
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>이메일</Text>
          <TextInput
            style={styles.input}
            onChangeText={setEmail}
            value={email}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            style={styles.input}
            onChangeText={setPassword}
            value={password}
            secureTextEntry
          />
        </View>
        <View style={styles.checkboxContainer}>
          <CheckBox
            value={isChecked}
            onValueChange={setIsChecked}
            tintColors={{true: '#007AFF', false: '#aaa'}}
          />
          <Text style={styles.checkboxLabel}>로그인 정보 저장</Text>
        </View>
        <Pressable style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>로그인</Text>
        </Pressable>
        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>
        <View style={styles.snsButtons}>
          <LoginButton
            iconSource={require('../../assets/images/google.png')}
            text="Google 로그인"
            onPress={handleGoogleLogin}
          />
          <LoginButton
            iconSource={require('../../assets/images/naver.png')}
            text="Naver 로그인"
            onPress={handleNaver}
          />
          <LoginButton
            iconSource={require('../../assets/images/facebook.png')}
            text="Facebook 로그인"
            onPress={handleFacebookLogin}
          />
          {/* 이메일 찾기, 비밀번호 찾기 텍스트 */}
          <View style={styles.findContainer}>
            <Text
              style={styles.findText}
              onPress={() => navigation.navigate('FindEmail')}>
              이메일 찾기
            </Text>
            <Text
              style={styles.findText}
              onPress={() => navigation.navigate('FindPassword')}>
              비밀번호 찾기
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 30,
  },
  logo: {
    width: 103,
    height: 93.34,
    marginBottom: 20,
  },
  title: {
    fontSize: 35,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 8,
  },
  label: {
    marginBottom: 5,
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  input: {
    width: '100%',
    backgroundColor: '#F8F4E1',
    padding: 10,
    borderRadius: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#FEBA15',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  snsIcon: {
    marginRight: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 0,
    width: '100%',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#D2D2D2',
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  snsButtons: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  snsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginVertical: 5,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  snsIconImage: {
    width: 24,
    height: 24,
    marginRight: 10,
    resizeMode: 'contain',
  },
  snsButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  findContainer: {
    flexDirection: 'column',
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
  },
  findText: {
    color: 'red',
    textDecorationLine: 'underline',
    fontWeight: '600',
    fontSize: 14,
  },
});
