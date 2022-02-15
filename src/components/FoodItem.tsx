import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Card, CardContent, CardDescription, CardHeader, CardMeta, GridColumn, Icon, Label, Placeholder, SemanticCOLORS, Image } from 'semantic-ui-react';
import { ISingleFoods, ResultFoods } from '../models/IFoods';
import { useNavigate } from 'react-router';
import { convertDate } from '../Util';
import { adminhFoodDelete, adminWaitPushFood } from '../Services';

interface itemType {
    item: ResultFoods,
    status?: boolean,
    isAdmin?: boolean,
}

export default function FoodItem(foods: itemType) {

    const navigate = useNavigate()

    function fncGotoDetail(url: string) {
        window.open("/details/" + url, "_blank")
    }

    const fncPush = () => {
        const itm = foods.item
        itm.enabled = true
        adminWaitPushFood(itm).then(res => {
            const dt: ISingleFoods = res.data
            if (dt.status === true) {
                window.location.href = "/waitFoodsList"
            }
        }).catch(err => {

        })
    }

    const deleteItem = () => {
        const itm = foods.item
        adminhFoodDelete(itm.gid!).then(res => {
            const dt: ISingleFoods = res.data
            if (dt.status === true) {
                window.location.href = "/waitFoodsList"
            }
        }).catch(err => {

        })
    }

    const glycemicColor = (index: number): SemanticCOLORS => {
        var color: SemanticCOLORS = 'red'
        if (index > 0 && index < 56) {
            color = 'olive'
        } else if (index > 55 && index < 71) {
            color = 'orange'
        } else if (index > 70) {
            color = 'red'
        }
        return color;
    }


    return (
        <>
            <GridColumn mobile={8} tablet={8} computer={4}>
                <Card>
                    <CardContent size="huge" fluid>
                        {foods.item.image !== "" &&
                            <Image src={foods.item.image} size={'huge'} />}

                        {foods.item.image === "" &&
                            <Image src='notfound.png' size={'huge'} centered />}
                      {foods.status &&
                        <Label as='a' basic color={foods.item.enabled === true ? "green" : "red"} ribbon>
                            {foods.item.enabled === true ? "Yayında" : "İnceleniyor"}
                        </Label>}
                        {!foods.status && <CardHeader>{foods.item.name}</CardHeader>}
                        <CardHeader>{foods.item.name}</CardHeader>
                        <CardMeta>
                            <span className='date'>Güncellenme Tarihi: {convertDate(foods.item.modifiedDate!)}</span>
                        </CardMeta>
                        <CardDescription>Ekleyen Kullanıcı: {foods.item.createdBy} </CardDescription>
                        <CardDescription>Kaynak: {foods.item.source} </CardDescription>
                    </CardContent>
                    <Label corner='right' size='medium' circular color={glycemicColor(foods.item.glycemicindex!)} >{foods.item.glycemicindex}
                    </Label>
                    <div className="extra content">
                        <Card.Content extra>
                            <div className='ui two buttons'>
                                {!foods.isAdmin &&
                                    <>
                                        <Button basic color='green' onClick={() => fncGotoDetail(foods.item.url!)} >
                                            <Icon name='info' />Detay
                                        </Button>

                                        <Button basic color='red'>
                                            <Icon name='food' />Ekle
                                        </Button>
                                    </>
                                }

                                {foods.isAdmin &&
                                    <>
                                        <Button basic color='green' onClick={() => fncPush()} >
                                            <Icon name='info' />Yayınla
                                        </Button>

                                        <Button basic color='red' onClick={() => deleteItem()}>
                                            <Icon name='delete' />Sil
                                        </Button>
                                    </>
                                }

                            </div>
                        </Card.Content>
                    </div>
                </Card>

            </GridColumn>

        </>
    );
}
