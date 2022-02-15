import React, { FormEvent, useEffect, useState } from 'react';
import { Menu, Button, Modal, Form, Icon, Segment, Label } from 'semantic-ui-react';
import { cities } from '../Datas';
import { IUser, UserResult } from '../models/IUser';
import { userAndAdminLogin, logout, userRegister } from '../Services';
import { ToastContainer, toast } from 'react-toastify';
import { control, encryptData } from '../Util'
import { useLocation, useNavigate } from 'react-router-dom';


export default function NavMenu() {

  const [activeItem, setActiveItem] = useState("Anasayfa")
  
  // modal delete state
  const [modalStatus, setModalStatus] = useState(false);
  const [modalLoginStatus, setModalLoginStatus] = useState(false)

  // login and register states
  const [userName, setUserName] = useState("");
  const [userSurname, setUserSurname] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userMail, setUserMail] = useState("");
  const [userPass, setUserPass] = useState("");
  const [cityId, setCityId] = useState('0')

  // login user object
  const [user, setUser] = useState<UserResult | null>()

  // logout
  const [isLogOut, setIsLogOut] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // login status
  const [loginStatus, setLoginStatus] = useState(false)
  useEffect(() => {
    urlActive()
    const usr = control()
    if (usr !== null) {
      setUser(usr)
      usr.roles!.forEach(item => {
        if ( item.name === "ROLE_admin" ) {
          setIsAdmin(true)
        }
      });
    }
  }, [loginStatus])

  // url control and menu active
  const urlActive = () => {
    if ( loc.pathname === "/" ) {
      setActiveItem("Anasayfa")
    }
    if ( loc.pathname === "/foodsAdd" ) {
      setActiveItem("Gıda Ekle")
    }
    if ( loc.pathname === "/foodsList" ) {
      setActiveItem("Eklediklerim")
    }
    if ( loc.pathname === "/waitFoodsList" ) {
      setActiveItem("Bekleyenler")
    }
  }
  
  // useNavigate
  const navigate = useNavigate()
  const loc = useLocation()
   
  const handleItemClick = (name:string) => {
    console.log('name', name)
    setActiveItem(name)

    if ( name === "Anasayfa" ) {
      navigate("/")
    }

    if ( name === "Gıda Ekle" ) {
      if ( control() === null ) {
        setModalLoginStatus(true);
      }else {
        navigate("/foodsAdd")
      }
    }


    if ( name === "Eklediklerim" ) {
      if ( control() === null ) {
        setModalLoginStatus(true);
      }else {
        navigate("/foodsList")
      }
    }

    if ( name === "Bekleyenler" ) {
      if ( control() === null ) {
        setModalLoginStatus(true);
      }else {
        navigate("/waitFoodsList")
      }
    }

  }

  const showModal = () => {
    setModalStatus(true);
  }

const showLoginModalStatus = () => {
    setModalLoginStatus(true);
  }


  // login fnc
  let regemail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
  const login = ( e:React.FormEvent ) => {
    e.preventDefault()
    if (userMail == '') {
      toast.warning('Lütfen email alanını doldurunuz!');
    }else if (regemail.test(userMail) === false){
      toast.warning('Lütfen geçerli bir email giriniz!')        
    }else if (userPass == ''){
      toast.warning('Lütfen şifre alanını doldurunuz!');    
    }else{
      toast.loading("Yükleniyor.")
      userAndAdminLogin(userMail, userPass).then( res => {
        const usr: IUser = res.data
        if ( usr.status! ) {
          const userResult = usr.result!
          // key
          const key = process.env.REACT_APP_SALT
          const cryptString = encryptData(userResult, key!)
          const userAutString = encryptData(res.config.headers, key!)
          localStorage.setItem( "user", cryptString )
          localStorage.setItem( "aut", userAutString )
          setLoginStatus( usr.status! )
          setModalLoginStatus(false)
        }
        toast.dismiss();
      }).catch( err => {
        toast.dismiss();
        toast.error( "Bu yetkilerde bir kullanıcı yok!" )
      })
    }
  }


  // register fnc
  let regphone = /^[0]?[5]\d{9}$/;
  const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
  const register = ( e: React.FormEvent ) => {
    e.preventDefault()
    if (userName == '') {
      toast.warning('Lütfen isim alanını doldurunuz!');
    } else if (userSurname == '') {
      toast.warning('Lütfen soyadı alanını doldurunuz!');
    } else if (userPhone == '') {
      toast.warning('Lütfen telefon alanını doldurunuz!');
    }else if (regphone.test(userPhone) === false) {
      toast.warning('Lütfen geçerli bir telefon numarası giriniz!');
    } else if (userMail == '') {
      toast.warning('Lütfen email alanını doldurunuz!');
    }else if (regemail.test(userMail) === false){
      toast.warning('Lütfen geçerli bir email giriniz!')        
    }    
    else if (userPass == '') {
      toast.warning('Lütfen şifre alanını doldurunuz!');
    }else if (userPass.length <= 8){      
      toast.warning('Şifre 8 karakterden kısa olamaz!');
    }
    else if (!strongRegex.test(userPass)) {
      toast.warning('Şifreniz en az bir büyük bir küçük harf özel işaret ve numara içermelidir!'); 
    }else{
      toast.loading("Yükleniyor.")
      userRegister( userName, userSurname, parseInt(cityId), userPhone, userMail, userPass )
      .then(res => {

        const usr:IUser = res.data
        toast.dismiss();
        if ( usr.status ) {
          // kayıt başarılı
          toast.info("Kayıt işlemi başarılı oldu, Lütfen giriş yapınız")
          setModalStatus(false)
          setModalLoginStatus(true)
        }else {
          toast.error( usr.message )
        }
      
      }).catch(err => {
        toast.dismiss();
        toast.error( "Kayıt işlemi sırasında bir hata oluştu!" )
      })
    }
  }

  // log out fnc
  const fncLogOut = () => {
      toast.loading("Yükleniyor.")
      logout().then( res => {
        localStorage.removeItem("user")
        setIsLogOut(false)
        setUser(null)
        setLoginStatus(false)
        setIsAdmin(false)
        toast.dismiss();
        window.location.href = "/"
    }).catch(err => {
      toast.dismiss();
      toast.error( "Çıkış işlemi sırasında bir hata oluştu!" )
    })
  }


  return (
    <>
        <Menu secondary inverted color='green'>
          <Menu.Item>
            <img alt="logo" src='/logo.png' />
          </Menu.Item>
            <Menu.Item
            name='Anasayfa'
            active={activeItem === 'Anasayfa'}
            onClick={ (e, data) => handleItemClick(data.name!) }
            />
            <Menu.Item
            name='Gıda Ekle'
            active={activeItem === 'Gıda Ekle'}
            onClick={ (e, data) => handleItemClick(data.name!) }
            />
            <Menu.Item
            name='Eklediklerim'
            active={activeItem === 'Eklediklerim'}
            onClick={ (e, data) => handleItemClick(data.name!) }
            />

            { isAdmin === true && 
              <Menu.Item
              name='Bekleyenler'
              active={activeItem === 'Bekleyenler'}
              onClick={ (e, data) => handleItemClick(data.name!) }
              />
            }

            <Menu.Menu position='right'>

            { !user && 
            <>
              <Menu.Item
                  name='Giriş Yap'
                  active={activeItem === 'Giriş Yap'}
                  onClick={ (e, data) => showLoginModalStatus() }
              />
              <Menu.Item
                  name='Kayıt Ol'
                  active={activeItem === 'Kayıt Ol'}
                  onClick={ (e, data) => showModal() }
              />
            </>}

            { user && 
            <>
            
             <Menu.Item>
              <Label size='large' color='yellow' >
                <Icon name='user outline' /> { user.name } { user.surname }
              </Label>
             </Menu.Item>

              <Menu.Item
                  name='Çıkış Yap'
                  active={activeItem === 'Çıkış Yap'}
                  onClick={ (e, data) => setIsLogOut(true) }
              />
            </>}

            </Menu.Menu>
        </Menu>


            <Modal
                size='tiny'
                open={modalStatus}
                onClose={ () => setModalStatus(false) }   
            >
            <Modal.Header>Kayıt Formu</Modal.Header>
            <Modal.Content>   
            <Modal.Description>
                <p>Lütfen aşağıdaki bilgileri eksiksiz doldurunuz!</p>
                <Form>
                  <Form.Group widths='equal'>
                    <Form.Input  value={userName} icon='user' iconPosition='left' onChange={(e) => setUserName(e.target.value)} fluid placeholder='Adınız' />
                  </Form.Group>
                  <Form.Group widths='equal'>
                    <Form.Input  value={userSurname} icon='user' iconPosition='left' onChange={(e) => setUserSurname(e.target.value)} fluid placeholder='Soyadınız' />
                  </Form.Group>
                  <Form.Group widths='equal'>
                    <Form.Select  value={cityId} fluid placeholder='Şehir Seç' options={cities} search onChange={(e,d) => setCityId( ""+d.value )} />
                  </Form.Group>
                  <Form.Group widths='equal'>
                    <Form.Input value={userPhone} type='tel'  icon='mobile' onChange={(e) => setUserPhone(e.target.value)} iconPosition='left' fluid placeholder='Telefon' />
                  </Form.Group>
                  <Form.Group widths='equal'>
                    <Form.Input value={userMail} type='mail'  icon='mail' onChange={(e) => setUserMail(e.target.value)} iconPosition='left' fluid placeholder='Email' />
                  </Form.Group>
                  <Form.Group widths='equal'>
                    <Form.Input value={userPass} type='password' icon='key' onChange={(e) => setUserPass(e.target.value)} iconPosition='left' fluid placeholder='Şifre' />
                  </Form.Group>
                  <Button negative onClick={(e) => setModalStatus(false)}><Icon name='remove circle' /> Vazgeç</Button>
                  <Button onClick={(e) => register(e) } primary>
                    <Icon name='sign-in alternate'></Icon>
                      Kayıt Ol
                  </Button>
                </Form>
            </Modal.Description>
            </Modal.Content>
            </Modal>


            <Modal
              size='tiny'
              open={modalLoginStatus}
              onClose={ () => setModalLoginStatus(false) }   
            >
            <Modal.Header>Üye Girişi</Modal.Header>
            <Modal.Content>
            <Modal.Description>
             
              <Form onSubmit={(e) => login(e) } >
                <p>Lütfen aşağıdaki bilgileri eksiksiz doldurunuz!</p>
                <Form.Group widths='equal'>
                    <Form.Input value={userMail} onChange={(e,d) => setUserMail( d.value )} type='mail'  icon='mail' iconPosition='left' fluid placeholder='Email' />
                  </Form.Group>
                  <Form.Group widths='equal'>
                    <Form.Input value={userPass}  onChange={(e,d) => setUserPass(d.value)} type='password' icon='key' iconPosition='left' fluid placeholder='Şifre' />
                  </Form.Group>
                  <Button negative onClick={(e) => setModalLoginStatus(false)}><Icon name='remove circle' /> Vazgeç</Button>
                  <Button type='submit' primary>
                    <Icon name='sign-in alternate'></Icon>
                      Giriş Yap
                  </Button>
              </Form>
            </Modal.Description>
            </Modal.Content>
            </Modal>
            

        <Modal
          size='mini'
          open={isLogOut}
          onClose={() => setIsLogOut(false) }
        >
        <Modal.Header>Çıkış İşlemi</Modal.Header>
        <Modal.Content>
          <p>Çıkmak istediğinizden emin misniz?</p>
        </Modal.Content>
        <Modal.Actions>
          <Button negative onClick={() => setIsLogOut(false) }>
            İptal
          </Button>
          <Button positive onClick={() => fncLogOut() }>
            Çıkış Yap
          </Button>
        </Modal.Actions>
      </Modal>

    </>

  )
}