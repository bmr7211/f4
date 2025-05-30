import * as React from 'react';
import {useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {CheckBox} from 'react-native-elements';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

type SignUpScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SignUp'
>;

type Props = {
  navigation: SignUpScreenNavigationProp;
};

type EmailCheckResponse = {
  is_duplicate: boolean;
};

const SignUp: React.FC<Props> = ({navigation}) => {
  const [name, setName] = useState<string>('');
  const [telphone, setTelphone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [password2, setPassword2] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [emailCheckResult, setEmailCheckResult] = useState<string>('');
  const [agree, setAgree] = useState<boolean>(false);

  const handleSignUp = () => {
    console.log('SENCITY에 가입해주셔서 감사합니다.');
    console.log({name, telphone, email, password, address});
    navigation.navigate('Login');
  };

  const handleEmailCheck = async () => {
    if (!email) {
      Alert.alert('알림', '이메일을 입력해주세요');
      return;
    }
    try {
      const response = await fetch('http://172.18.41.61:8000/api/signup/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email}),
      });
      const data: EmailCheckResponse = await response.json();

      if (data.is_duplicate) {
        setEmailCheckResult('이미 사용중인 이메일입니다.');
      } else {
        setEmailCheckResult('사용 가능한 이메일입니다.');
      }
    } catch (error) {
      console.error(error);
      setEmailCheckResult('오류가 발생했습니다');
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.formSection}>
          <Text style={styles.title}>SENCITY{'\n'}회원가입</Text>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="이름"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="전화번호"
              value={telphone}
              onChangeText={setTelphone}
              keyboardType="phone-pad"
            />
          </View>

          <View
            style={[
              styles.inputWrapper,
              {flexDirection: 'row', alignItems: 'center'},
            ]}>
            <TextInput
              style={[styles.input, {flex: 1, marginBottom: 0}]}
              placeholder="이메일"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={handleEmailCheck}
              style={styles.checkButton}>
              <Text style={styles.checkButtonText}>중복확인</Text>
            </TouchableOpacity>
          </View>

          {emailCheckResult !== '' && (
            <Text style={{marginBottom: 10, color: 'red'}}>
              {emailCheckResult}
            </Text>
          )}

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="비밀번호"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="비밀번호 재입력"
              value={password2}
              onChangeText={setPassword2}
              secureTextEntry
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="주소(선택입력)"
              value={address}
              onChangeText={setAddress}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.checkboxWrapper}>
            <CheckBox
              checked={agree}
              onPress={() => setAgree(!agree)}
              containerStyle={styles.checkboxContainer}
            />
            <Text style={styles.checkboxLabel}>
              약관 및 개인정보 처리방침에 동의합니다.
            </Text>
          </View>
          <View style={styles.signupButtonContainer}>
            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignUp}
              activeOpacity={0.8}>
              <Text style={styles.signupButtonText}>회원가입</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  formSection: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  title: {
    fontSize: 35,
    marginBottom: 20,
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: 20,
    fontWeight: 'bold',
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#D2D2D2',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  input: {
    paddingHorizontal: 10,
    height: 40,
    borderRadius: 5,
  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 10,
    width: '100%',
  },
  checkboxContainer: {
    padding: 0,
    margin: 0,
    marginRight: 8,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  checkButton: {
    borderWidth: 1,
    borderColor: '#D2D2D2',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginLeft: 10,
    justifyContent: 'center',
    height: 40,
  },
  checkButtonText: {
    color: '#000',
    fontSize: 14,
  },

  signupButtonContainer: {
    width: '100%',
  },
  signupButton: {
    backgroundColor: '#FEBA15',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  signupButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SignUp;
