import React, { FormEvent, useEffect, useState } from 'react';
import { Menu, Button, Modal, Form, Icon, Segment, Label, Card, Feed, Item } from 'semantic-ui-react';
import { cities } from '../Datas';
import { IUser, UserResult } from '../models/IUser';
import { userAndAdminLogin, logout, userRegister } from '../Services';
import { ToastContainer, toast } from 'react-toastify';
import { allDataBasket, control, deleteItemBasket, encryptData } from '../Util'
import { useLocation, useNavigate } from 'react-router-dom';
import { ResultFoods } from '../models/IFoods';


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

  //basket
  const [basketCount, setBasketCount] = useState(0)
  const [visible, setVisible] = useState(false)
  const [basketItems, setBasketItems] = useState<ResultFoods[]>([])
  const [sumGly, setSumGly] = useState(0)
  console.log('setBasketItems', basketItems.length)

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
        if (item.name === "ROLE_admin") {
          setIsAdmin(true)
        }
      });
    }
  }, [loginStatus])





  // url control and menu active
  const urlActive = () => {
    if (loc.pathname === "/") {
      setActiveItem("Anasayfa")
    }
    if (loc.pathname === "/foodsAdd") {
      setActiveItem("G??da Ekle")
    }
    if (loc.pathname === "/foodsList") {
      setActiveItem("Eklediklerim")
    }
    if (loc.pathname === "/waitFoodsList") {
      setActiveItem("Bekleyenler")
    }
  }

  // useNavigate
  const navigate = useNavigate()
  const loc = useLocation()

  const handleItemClick = (name: string) => {
    setActiveItem(name)

    if (name === "Anasayfa") {
      navigate("/")
    }

    if (name === "G??da Ekle") {
      if (control() === null) {
        setModalLoginStatus(true);
      } else {
        navigate("/foodsAdd")
      }
    }


    if (name === "Eklediklerim") {
      if (control() === null) {
        setModalLoginStatus(true);
      } else {
        navigate("/foodsList")
      }
    }

    if (name === "Bekleyenler") {
      if (control() === null) {
        setModalLoginStatus(true);
      } else {
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
  const login = (e: React.FormEvent) => {
    e.preventDefault()
    if (userMail == '') {
      toast.warning('L??tfen email alan??n?? doldurunuz!');
    } else if (regemail.test(userMail) === false) {
      toast.warning('L??tfen ge??erli bir email giriniz!')
    } else if (userPass == '') {
      toast.warning('L??tfen ??ifre alan??n?? doldurunuz!');
    } else {
      toast.loading("Y??kleniyor.")
      userAndAdminLogin(userMail, userPass).then(res => {
        const usr: IUser = res.data
        if (usr.status!) {
          const userResult = usr.result!
          // key
          const key = process.env.REACT_APP_SALT
          const cryptString = encryptData(userResult, key!)
          const userAutString = encryptData(res.config.headers, key!)
          localStorage.setItem("user", cryptString)
          localStorage.setItem("aut", userAutString)
          setLoginStatus(usr.status!)
          setModalLoginStatus(false)
        }
        toast.dismiss();
      }).catch(err => {
        toast.dismiss();
        toast.error("Bu yetkilerde bir kullan??c?? yok!")
      })
    }
  }


  // register fnc
  let regphone = /^[0]?[5]\d{9}$/;
  const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
  const register = (e: React.FormEvent) => {
    e.preventDefault()
    if (userName == '') {
      toast.warning('L??tfen isim alan??n?? doldurunuz!');
    } else if (userSurname == '') {
      toast.warning('L??tfen soyad?? alan??n?? doldurunuz!');
    } else if (userPhone == '') {
      toast.warning('L??tfen telefon alan??n?? doldurunuz!');
    } else if (regphone.test(userPhone) === false) {
      toast.warning('L??tfen ge??erli bir telefon numaras?? giriniz!');
    } else if (userMail == '') {
      toast.warning('L??tfen email alan??n?? doldurunuz!');
    } else if (regemail.test(userMail) === false) {
      toast.warning('L??tfen ge??erli bir email giriniz!')
    }
    else if (userPass == '') {
      toast.warning('L??tfen ??ifre alan??n?? doldurunuz!');
    } else if (userPass.length <= 8) {
      toast.warning('??ifre 8 karakterden k??sa olamaz!');
    }
    else if (!strongRegex.test(userPass)) {
      toast.warning('??ifreniz en az bir b??y??k bir k??????k harf ??zel i??aret ve numara i??ermelidir!');
    } else {
      toast.loading("Y??kleniyor.")
      userRegister(userName, userSurname, parseInt(cityId), userPhone, userMail, userPass)
        .then(res => {

          const usr: IUser = res.data
          toast.dismiss();
          if (usr.status) {
            // kay??t ba??ar??l??
            toast.info("Kay??t i??lemi ba??ar??l?? oldu, L??tfen giri?? yap??n??z")
            setModalStatus(false)
            setModalLoginStatus(true)
          } else {
            toast.error(usr.message)
          }

        }).catch(err => {
          toast.dismiss();
          toast.error("Kay??t i??lemi s??ras??nda bir hata olu??tu!")
        })
    }
  }

  // log out fnc
  const fncLogOut = () => {
    toast.loading("Y??kleniyor.")
    logout().then(res => {
      localStorage.removeItem("user")
      setIsLogOut(false)
      setUser(null)
      setLoginStatus(false)
      setIsAdmin(false)
      toast.dismiss();
      window.location.href = "/"
    }).catch(err => {
      toast.dismiss();
      toast.error("????k???? i??lemi s??ras??nda bir hata olu??tu!")
    })
  }


  useEffect(() => {
    setBasketItems(allDataBasket())
  }, [visible])

  const deleteFnc = (index: number) => {
    setBasketItems(deleteItemBasket(index))
  }
  useEffect(() => {
    for (let index = 0; index < basketItems.length; index++) {
      const element = basketItems[index];
      return sumGlyFnc(element.glycemicindex!)  
   }
   }, [basketItems])


  const sumGlyFnc = (item: number) => {
    const sum = item + sumGly
    return setSumGly(sum)

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
          onClick={(e, data) => handleItemClick(data.name!)}
        />
        <Menu.Item
          name='G??da Ekle'
          active={activeItem === 'G??da Ekle'}
          onClick={(e, data) => handleItemClick(data.name!)}
        />
        <Menu.Item
          name='Eklediklerim'
          active={activeItem === 'Eklediklerim'}
          onClick={(e, data) => handleItemClick(data.name!)}
        />

        {isAdmin === true &&
          <Menu.Item
            name='Bekleyenler'
            active={activeItem === 'Bekleyenler'}
            onClick={(e, data) => handleItemClick(data.name!)}
          />
        }

        <Menu.Menu position='right'>

          {!user &&
            <>
              <Menu.Item
                name='Giri?? Yap'
                active={activeItem === 'Giri?? Yap'}
                onClick={(e, data) => showLoginModalStatus()}
              />
              <Menu.Item
                name='Kay??t Ol'
                active={activeItem === 'Kay??t Ol'}
                onClick={(e, data) => showModal()}
              />
            </>}

          {user &&
            <>

              <Menu.Item>
                <Label size='large' color='yellow' >
                  <Icon name='user outline' /> {user.name} {user.surname}
                </Label>
              </Menu.Item>

              <Menu.Item
                name='????k???? Yap'
                active={activeItem === '????k???? Yap'}
                onClick={(e, data) => setIsLogOut(true)}
              />
            </>}

        </Menu.Menu>
        <Menu.Item >
          <Button inverted color='black' animated='vertical' onClick={(e, d) => setVisible(!visible)}>
            <Button.Content visible> {basketItems.length} </Button.Content>
            <Button.Content hidden>
              <Icon name='shop' />
            </Button.Content>
          </Button>
        </Menu.Item>

        {visible &&
          <Card style={{ position: 'absolute', zIndex: 2, top: 72, right: '0.5%' }}>
            <Card.Content>
              <Card.Header>Men??n??z</Card.Header>
            </Card.Content>
            <Card.Content>
              <Feed>

                {basketItems.map((item, index) =>
                  <Feed.Event key={index} >
                    <Feed.Label image={item.image === "" ? './notfound.png' : item.image} />
                    <Feed.Content >
                      <Feed.Date content={item.glycemicindex} />
                      <Feed.Summary>
                        {item.name}
                      </Feed.Summary>
                    </Feed.Content>
                    <Feed.Content style={{ textAlign: 'right' }}>
                      <Button onClick={(e, d) => {deleteFnc(index) ; sumGlyFnc(-item.glycemicindex!)}} size='mini' color='red' >
                        <Button.Content><Icon name='delete'></Icon></Button.Content>
                      </Button>

                    </Feed.Content>

                  </Feed.Event>

                )}


              </Feed>

              <Label color='blue'>Toplam Glycemic Index: {sumGly}</Label>
            </Card.Content>
          </Card>
        }
      </Menu>


      <Modal
        size='tiny'
        open={modalStatus}
        onClose={() => setModalStatus(false)}
      >
        <Modal.Header>Kay??t Formu</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <p>L??tfen a??a????daki bilgileri eksiksiz doldurunuz!</p>
            <Form>
              <Form.Group widths='equal'>
                <Form.Input value={userName} icon='user' iconPosition='left' onChange={(e) => setUserName(e.target.value)} fluid placeholder='Ad??n??z' />
              </Form.Group>
              <Form.Group widths='equal'>
                <Form.Input value={userSurname} icon='user' iconPosition='left' onChange={(e) => setUserSurname(e.target.value)} fluid placeholder='Soyad??n??z' />
              </Form.Group>
              <Form.Group widths='equal'>
                <Form.Select value={cityId} fluid placeholder='??ehir Se??' options={cities} search onChange={(e, d) => setCityId("" + d.value)} />
              </Form.Group>
              <Form.Group widths='equal'>
                <Form.Input value={userPhone} type='tel' icon='mobile' onChange={(e) => setUserPhone(e.target.value)} iconPosition='left' fluid placeholder='Telefon' />
              </Form.Group>
              <Form.Group widths='equal'>
                <Form.Input value={userMail} type='mail' icon='mail' onChange={(e) => setUserMail(e.target.value)} iconPosition='left' fluid placeholder='Email' />
              </Form.Group>
              <Form.Group widths='equal'>
                <Form.Input value={userPass} type='password' icon='key' onChange={(e) => setUserPass(e.target.value)} iconPosition='left' fluid placeholder='??ifre' />
              </Form.Group>
              <Button negative onClick={(e) => setModalStatus(false)}><Icon name='remove circle' /> Vazge??</Button>
              <Button onClick={(e) => register(e)} primary>
                <Icon name='sign-in alternate'></Icon>
                Kay??t Ol
              </Button>
            </Form>
          </Modal.Description>
        </Modal.Content>
      </Modal>


      <Modal
        size='tiny'
        open={modalLoginStatus}
        onClose={() => setModalLoginStatus(false)}
      >
        <Modal.Header>??ye Giri??i</Modal.Header>
        <Modal.Content>
          <Modal.Description>

            <Form onSubmit={(e) => login(e)} >
              <p>L??tfen a??a????daki bilgileri eksiksiz doldurunuz!</p>
              <Form.Group widths='equal'>
                <Form.Input value={userMail} onChange={(e, d) => setUserMail(d.value)} type='mail' icon='mail' iconPosition='left' fluid placeholder='Email' />
              </Form.Group>
              <Form.Group widths='equal'>
                <Form.Input value={userPass} onChange={(e, d) => setUserPass(d.value)} type='password' icon='key' iconPosition='left' fluid placeholder='??ifre' />
              </Form.Group>
              <Button negative onClick={(e) => setModalLoginStatus(false)}><Icon name='remove circle' /> Vazge??</Button>
              <Button type='submit' primary>
                <Icon name='sign-in alternate'></Icon>
                Giri?? Yap
              </Button>
            </Form>
          </Modal.Description>
        </Modal.Content>
      </Modal>


      <Modal
        size='mini'
        open={isLogOut}
        onClose={() => setIsLogOut(false)}
      >
        <Modal.Header>????k???? ????lemi</Modal.Header>
        <Modal.Content>
          <p>????kmak istedi??inizden emin misniz?</p>
        </Modal.Content>
        <Modal.Actions>
          <Button negative onClick={() => setIsLogOut(false)}>
            ??ptal
          </Button>
          <Button positive onClick={() => fncLogOut()}>
            ????k???? Yap
          </Button>
        </Modal.Actions>
      </Modal>

    </>

  )
}
