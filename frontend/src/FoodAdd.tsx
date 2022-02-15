import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'
import { Divider, Form, Grid, Header, InputOnChangeData, Segment, Transition } from 'semantic-ui-react'
import SiteMenu from './components/NavMenu'
import { categories } from './Datas';
import { ISingleFoods } from './models/IFoods';
import { foodAdd } from './Services';
import { autControl } from './Util';

export default function FoodsAdd() {

  const navigate = useNavigate()

  // form item states
  const [name, setName] = useState("")
  const [glycemicindex, setGlycemicindex] = useState("")
  const [source, setSource] = useState("")
  const [cid, setCid] = useState('0')
  const [base64Image, setBase64Image] = useState("")

  // animation
  const [visible, setVisible] = useState(false)

  const fncFoodAdd = () => {
    
    if (name == '') {
      toast.warning('Lütfen gıda ismi alanını doldurunuz!');
    } else if (glycemicindex == "") {
      toast.warning('Lütfen glysemic index alanını doldurunuz!');
    } else if (source == '') {
      toast.warning('Lütfen kaynak alanını doldurunuz!');
    }else if (cid == "") {
      toast.warning('Lütfen bir kategori giriniz!');
    } else if (base64Image == '') {
      toast.warning('Lütfen bir resim yükleyiniz!');
    }else {
      toast.loading("Yükleniyor.")
      
      foodAdd( parseInt(cid), name, parseInt(glycemicindex),  base64Image, source)
      .then(res => { 
        const food:ISingleFoods = res.data
        toast.dismiss(); 
        if ( food.status ) {
          // ekleme başarılı
          toast.success("Ürün ekleme işlemi başarılı") 
          setTimeout(() => {
            navigate("/foodsList")
          }, 1000);        
        }else { 
          toast.error( food.message )
        }
       }).catch(err => {
        toast.dismiss();
        toast.error( "Ürün ekleme işlemi sırasında bir hata oluştu!" )
      })
    }    
  }

  // image to base64
  const imageOnChange = (e:any, d:InputOnChangeData) => {
        const file = e.target.files[0]
        const size:number = file.size / 1024 // kb
        if ( size > 100 ) { 
            toast.error("Lütfen max 100 kb bir resim seçiniz!")
        }else {
            getBase64(file).then( res => {
                setBase64Image(""+res)
            })
        } 
  }

  useEffect(() => {
    if( autControl() === null ) {
      localStorage.removeItem("user")
      localStorage.removeItem("aut")
      navigate("/")
    }
    setTimeout(() => {
      setVisible(true)
    }, 500);
  }, [])
  

  const getBase64 = ( file: any ) => {
    return new Promise(resolve => {
        let fileInfo;
        let baseURL:any = "";
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          baseURL = reader.result
          resolve(baseURL);
        };
        console.log(fileInfo);
      });
  }

  return (
    <>
    <ToastContainer />
    <SiteMenu />
    <Header as='h3' block>
        Gıda Ekle
    </Header>
    <Transition visible={visible} animation='slide down' duration={750}>
      <Segment vertical color='grey'  >
        Burada eklediğiniz gıdalar, admin onayına gidip denetimden geçtikten sonra yayına alınır.
      </Segment>
    </Transition>

    <Segment>
    <Form>
        <Form.Group widths='equal'>
          <Form.Input onChange={(e) => setName(e.target.value)} fluid label='Adı' placeholder='Adı' />
          <Form.Input onChange={(e) => setGlycemicindex(e.target.value)} type='number' min='0' max='150' fluid label='Glisemik İndex' placeholder='Glisemik İndex' />
          <Form.Select  label='Kategori' value={cid} fluid placeholder='Kategori' options={categories} search onChange={(e,d) => setCid( ""+d.value )} />
        </Form.Group>
        
        <Form.Group widths='equal'>
            <Form.Input onChange={(e, d) => imageOnChange(e,d) } type='file' fluid label='Resim' placeholder='Resim' />
            <Form.Input onChange={(e) => setSource(e.target.value)} fluid label='Kaynak' placeholder='Kaynak' />
        </Form.Group>
       
        <Form.Button onClick={(e) => fncFoodAdd()} >Gönder</Form.Button>
      </Form>
      </Segment>
      

    </>
  )
}
