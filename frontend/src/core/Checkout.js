import React, { useEffect, useState } from 'react';
import Layout from './Layout'
import { getProducts,getBraintreeClientToken,processPayment,createOrder } from './apiCore'
import Card from './Cards'
import {isAuthenticated} from '../auth'
import { Link } from 'react-router-dom';
import DropIn from 'braintree-web-drop-in-react'
import {emptyCart} from './cartHelpers'


const Checkout = ({products,setRun = f => f, run = undefined})=>{
    const[data,setData] = useState({
        loading: false,
        success: false,
        clientToken: null,
        error: '',
        instance: {},
        address: ''
    })

    const userId = isAuthenticated() && isAuthenticated().user._id
    const token = isAuthenticated() && isAuthenticated().token

    const getToken = (userId,token) => {
        getBraintreeClientToken(userId,token).then(data=>{
            if(data.error){
                setData({...data,error:data.error})
            }else{
                setData({ clientToken: data.clientToken})
            }
        })
    }

    useEffect(()=>{
        getToken(userId,token)
    },[])

    const handleAddress = event =>{
        setData({...data,address: event.target.value})
    }

    const getTotal = () =>{
        return products.reduce((currentValue,nextValue)=>{
            return currentValue + nextValue.count * nextValue.price

        },0)
    }

    const showCheckout = () => {
        return isAuthenticated() ? (
             <div>{ShowDropIn()}</div>
        ) : (
            <Link to="/signin">
                <button className="btn btn-primary">Sign in to Checkout</button>
            </Link>
        )
    }

    let deliveryAddress = data.address

    const buy = () => {
        setData({loading: true})
        let nonce;
        let getNonce  = data.instance.requestPaymentMethod()
        .then(data=>{
            //console.log(data)
            nonce = data.nonce
            //console.log(nonce,getTotal(products))
            const paymentData = {
                paymentMethodNonce: nonce,
                amount: getTotal(products)
            }
            processPayment(userId,token,paymentData)
            .then(response=>{
                const createOrderData = {
                    products: products,
                    transaction_id: response.transaction.id,
                    amount: response.transaction.amount,
                    address: deliveryAddress

                }
                console.log(createOrderData)

                createOrder(userId, token, createOrderData)
                .then(response => {
                    emptyCart(() => {
                        setRun(!run); // run useEffect in parent Cart
                        console.log('payment success and empty cart');
                        setData({
                            loading: false,
                            success: true
                        });
                    });
                })
                .catch(error => {
                    console.log(error);
                    setData({ loading: false });
                });



                
            })
            .catch(error=>{
                //console.log(error)
                setData({loading: false})

            })
        })
        .catch(error=>{
            setData({...data,error: error.message})
        })
    }


    const ShowDropIn = () => (
        <div onBlur={()=>setData({...data,error: ""})}>
            {data.clientToken !== null && products.length > 0 ? (
                <div>
                    <div className="form-group mb-3">
                        <label className="text-muted">Delivery address</label>
                        <textarea
                            onChange={handleAddress}
                            className="form-control"
                            value={data.address}
                            placeholder="Type your addresss"/>
                       
                    </div>


                    <DropIn options={{
                        authorization: data.clientToken,
                        
                    }} onInstance={instance=>data.instance = instance}/>
                    <button onClick={buy} className="btn btn-success btn-block">Pay</button>
                </div>
            ) : null}
        </div>
    )

    const showError = error =>(
        <div 
            className="alert alert-danger" 
            style={{display: error ? '' : 'none'}}>
                {error}
        </div>
    )

    const showSuccess = success =>(
        <div 
            className="alert alert-info" 
            style={{display: success ? '' : 'none'}}>
                Thanks! Successfully Paid
        </div>
    )

    const showLoading = (loading) => (
        loading && <h2>loading</h2>
    )

    return (
    <div>
        <h1>Total: ${getTotal()}</h1>
        {showLoading(data.loading)}
        {showSuccess(data.success)}
        {showError(data.error)}
        {showCheckout()}
    </div>
)
}


export default Checkout