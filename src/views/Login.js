import React, { useEffect, useState } from 'react';
import {
  MDBContainer,
  MDBCol,
  MDBRow,
  MDBBtn,
  MDBIcon,
  MDBInput,
  MDBCheckbox
}
from 'mdb-react-ui-kit';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, fetchSignInMethodsForEmail } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';

import { database } from '../firebase/firebase';
import { Button } from 'reactstrap';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');


  //#region dang nhap = google
  const handleGoogleSignIn = async () => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      provider.addScope('email')
      const result = await signInWithPopup(auth, provider);
  
      const user = result.user;
     
      const userRef = ref(database, `Users/${user.uid}`);
      const snapshot = await get(userRef);

      const email = user.reloadUserInfo?.providerUserInfo?.[0]?.email;
  
      if (!snapshot.exists()) {
        await set(userRef, {
          email: email,
          full_name: user.displayName,
          id_role: "1",
          image_user: user.photoURL,
          is_active: true,
          phoneNumber: "",
          username: user.displayName.replace(/\s+/g, '').toLowerCase()
        });
      }
  
      navigate('/admin/dashboard');
    } catch (error) {
      console.error("Lỗi đăng nhập bằng Google:", error);
      setError('Đăng nhập Google không thành công!');
    }
  };


  //#region dang xuat
  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);

      localStorage.removeItem('userToken'); 
      sessionStorage.removeItem('userSession');

      navigate('/login'); 
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    }
  };

  useEffect(() => {
    handleLogout();
  }, []);

  const handleLogin = async () => {
    try {
      // Đăng nhập với email và mật khẩu
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Lấy thông tin người dùng từ Firebase Realtime Database
      const userRef = ref(database, 'Users/' + user.uid);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        
        // Kiểm tra nếu id_role là 1 (Admin)
        if (userData.id_role === '1') {
          // Chuyển hướng người dùng đến trang Admin
          navigate('/admin/dashboard');
        } else {
          setError('Bạn không phải là Admin!');
        }
      } else {
        setError('Không tìm thấy thông tin người dùng!');
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      setError('Đăng nhập không thành công!');
    }
  };

  return (
    <MDBContainer fluid className="p-3 my-5">

      <MDBRow>

        <MDBCol col='10' md='6'>
          <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg" class="img-fluid" alt="Phone image" />
        </MDBCol>

        <MDBCol col='4' md='6'>
            {error && <p style={{ color: 'red' }}>{error}</p>}

          <MDBInput wrapperClass='mb-4' label='Email address' id='formControlLg' type='email' size="lg" value={email} onChange={(e) => setEmail(e.target.value)} 
                    style=
                          {{ 
                              fontSize: '1rem',
                              height: '40px',
                              paddingLeft: '15px',
                              paddingRight: '15px',
                              width: '100%'
                          }} />
          <MDBInput wrapperClass='mb-4' label='Password' id='formControlLg' type='password' size="lg" value={password} onChange={(e) => setPassword(e.target.value)}
                    style=
                          {{ 
                              fontSize: '1.75rem',
                              height: '40px',
                              paddingLeft: '15px',
                              paddingRight: '15px',
                              width: '100%'
                          }} />


          <div className="d-flex justify-content-between mx-4 mb-4">
            <MDBCheckbox name='flexCheck' value='' id='flexCheckDefault' label='Remember me' />
            <a href="!#">Forgot password?</a>
          </div>

          <Button className="mb-4 w-100" size="lg" onClick={handleLogin} style={{backgroundColor: 'aqua'}}>Sign in</Button>

          <div className="divider d-flex align-items-center my-4">
            <p className="text-center fw-bold mx-3 mb-0">OR</p>
          </div>

          <MDBBtn className="mb-4 w-100" size="lg" style={{backgroundColor: '#3b5998'}}>
            <MDBIcon fab icon="facebook-f" className="mx-2"/>
            Continue with facebook
          </MDBBtn>

          <MDBBtn className="mb-4 w-100" size="lg" style={{backgroundColor: '#DB4437'}}  onClick={handleGoogleSignIn}>
            <MDBIcon fab icon="google" className="mx-2"/>
            Continue with google
          </MDBBtn>

        </MDBCol>

      </MDBRow>

    </MDBContainer>
  );
}

export default Login;