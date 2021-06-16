import React, { useEffect, useState } from 'react';
import Layout from './Layout'
import { read,listRelated } from './apiCore'
import Card from './Cards'

const Product = (props) => {
    const[product,setProduct] = useState({})
    const[relatedProduct,setRelatedProduct] = useState({
        loading: false
    })
    const[error,setError] = useState(false)

    const {loading} = relatedProduct

    const loadSingleProduct = productId =>{
        read(productId).then(data=>{
            if(data.error){
                setError(data.error)
            }else{
                setProduct(data)
                setRelatedProduct({loading: true})
                listRelated(data._id).then(data=>{
                    if(data.error){
                        setError(data.error)
                    }else{
                        setRelatedProduct(data, {loading: false})
                    }
                })
            }
        })
    }
    const showLoading = () =>
        loading && (
            <div className="alert alert-info">
                <h2>Loading...</h2>
            </div>
        );

    useEffect(()=>{
        const productId = props.match.params.productId
        loadSingleProduct(productId)
    },[props])
    return(
        <Layout
            title={product && product.name}
            description={product && product.description && product.description.substring(0,100)}
            className="container-fluid">
                <h2 className="mb-4">Single Product</h2>
                <div className="row">
                   <div className="col-8">
                   {
                    product && product.description && 
                    <div  className="col-4 mb-3">
                        <Card  product={product} showViewProductButton={false}/>
                    </div>
                    }
                   </div>
                   
                    {   
                        loading ? showLoading() :
                        relatedProduct.length >= 1 ?
                        <div className="col-4">
                       <h4>Related Products</h4>
                       {relatedProduct.map((p,i)=>(
                           <div key={i} className="mb-3">
                               <Card  product={p}/>
                           </div>
                       ))}
                        </div> : ''
                   }
                </div>
        </Layout>
    )
}

export default Product