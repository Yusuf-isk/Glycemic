import React, { SyntheticEvent, useEffect, useState } from 'react';
import { allFoodsList } from './Services';
import { ToastContainer, toast } from 'react-toastify';
import { IFoods, ResultFoods } from './models/IFoods';
import FoodItem from './components/FoodItem';
import { Dropdown, Grid, Input, Item, Pagination, PaginationProps, Segment } from 'semantic-ui-react';
import NavMenu from './components/NavMenu';
import { categories } from './Datas';

export default function Home() {
  const [foodsArr, setFoodsArr] = useState<ResultFoods[]>([]);
  const [searchArr, setSearchArr] = useState<ResultFoods[]>([]);

  // select category
  const [selectCategory, setSelectCategory] = useState(0)
  const [searchData, setSearchData] = useState("")

  // pages
  const [pageCount, setPageCount] = useState(0);
  const [postsperpage, setPostsPerPage] = useState(8)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const indexOfLastPost = currentPage * postsperpage;
  const indexOfFirstPost = indexOfLastPost - postsperpage;
  var currentpost = foodsArr.slice(indexOfFirstPost, indexOfLastPost);


  useEffect(() => {

    toast.loading("Yükleniyor.")
    allFoodsList().then(res => {
      const dt: IFoods = res.data;
      setFoodsArr(dt.result!)
      setSearchArr(dt.result!)
      if (Math.round(dt.result!.length % postsperpage) === 0) {
        setPageCount(dt.result!.length / postsperpage)
      } else {
        setPageCount(Math.ceil(dt.result!.length / postsperpage))
      }
      toast.dismiss();
    }).catch(err => {
      toast.dismiss();
      toast.error("" + err)
    })

  }, []);
  const search = (q: string) => {
    setCurrentPage(1)
    setSearchData(q)
    if (q === "") {
      var newArr: ResultFoods[] = searchArr
      if (selectCategory !== 0) {
        newArr = newArr.filter(item => item.cid === selectCategory)
      }
      setFoodsArr(newArr)
      if (Math.round(newArr.length % postsperpage) === 0) {
        setPageCount(newArr.length / postsperpage)
      } else {
        setPageCount(Math.ceil(newArr.length / postsperpage))
      }
    } else {
      q = q.toLowerCase()
      var newArr = searchArr.filter(item => item.name?.toLowerCase().includes(q) || ("" + item.glycemicindex).includes(q))
      if (selectCategory !== 0) {
        newArr = newArr.filter(item => item.cid === selectCategory)
      }
      setFoodsArr(newArr)
      if (Math.round(newArr.length % postsperpage) === 0) {
        setPageCount(newArr.length / postsperpage)
      } else {
        setPageCount(Math.ceil(newArr.length / postsperpage))
      }
    }
  }
  const catOnChange = (str: string) => {
    const numCat = parseInt(str)
    setCurrentPage(1)
    setSelectCategory(numCat)

    var newArr: ResultFoods[] = searchArr
    if (numCat !== 0) {
      newArr = newArr.filter(item => item.cid === numCat)
    }

    if (searchData !== "") {
      newArr = newArr.filter(item => item.name?.toLowerCase().includes(searchData) || ("" + item.glycemicindex).includes(searchData))
    }
    setFoodsArr(newArr)
    if (Math.round(newArr.length % postsperpage) === 0) {
      setPageCount(newArr.length / postsperpage)
    } else {
      setPageCount(Math.ceil(newArr.length / postsperpage))
    }

  }



  return (
    <>
      <ToastContainer />

      <NavMenu />

      <Grid >
        <Grid.Row>
          <Grid.Column>
            <Input onChange={(e) => search(e.target.value)} fluid style={{ marginBottom: 10, }}
              action={
                <Dropdown button basic floating onChange={(e, data) => catOnChange("" + data.value)} options={categories} placeholder="Kategori Seç" />
              }
              icon='search'
              iconPosition='left'
              placeholder='Search...'
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <Grid>

        {currentpost.map((item, index) =>
          <FoodItem key={index} item={item} />
        )}
      </Grid>
      {console.log(foodsArr)}
      <Grid centered padded={'horizontally'}>
        <Pagination
          defaultActivePage={currentPage}
          pointing

          totalPages={pageCount}
          onPageChange={(e: SyntheticEvent, { activePage }: PaginationProps) => setCurrentPage(parseInt("" + activePage!))}
        />    </Grid>
    </>
  );
}
