import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Card, Item } from 'semantic-ui-react'
import SiteMenu from './components/NavMenu'
import { ISingleFoods, ResultFoods } from './models/IFoods'
import { foodDetails } from './Services'
import { convertDate } from './Util'

export default function Details() {

    const [food, setFood] = useState<ResultFoods>()

    const { url } = useParams()
    useEffect(() => {
        foodDetails(url!).then(res => {
            const dt: ISingleFoods = res.data;
            setFood(dt.result!)
        }).catch(err => {
            toast.dismiss();
            toast.error("" + err)
        })
    }, [])

    return (
        <>
            <SiteMenu />
            <Card.Group>
                <Card fluid>
                    <Card.Content>

                        {food?.image !== "" &&
                            <Item.Image
                                floated='right'
                                size='medium'
                                src={food?.image}
                            />
                        }

                        {food?.image === "" &&
                            <Item.Image
                                floated='right'
                                size='medium'
                                src='../notfound.png'
                            />
                        }

                        <Card.Header >{food?.name} </Card.Header>
                        <Card.Meta style={{marginTop:'10px'}}>Glisemik İndeks: {food?.glycemicindex}</Card.Meta>
                        <Card.Meta style={{marginTop:'10px'}}>Oluşturulan Kişi: {food?.createdBy === null ? 'user@mail.com' : food?.createdBy}</Card.Meta>
                        <Card.Meta style={{marginTop:'10px'}}>Oluşturulma Tarihi: {convertDate(food?.createdDate!)}</Card.Meta>
                    </Card.Content>

                </Card>
            </Card.Group>



        </>
    )
}
