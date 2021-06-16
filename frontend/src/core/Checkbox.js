import React, { useState } from 'react';

const Checkbox = ({categories,handleFilters})=>{
    const[checked,setChecked] = useState([])

    const handleToggle = c => () => {
        const currentCategorId = checked.indexOf(c)
        const newCheckedCategoryId = [...checked]
        if(currentCategorId === -1){
            newCheckedCategoryId.push(c)
        }else{
            newCheckedCategoryId.splice(currentCategorId,1)
        }
        //console.log(newCheckedCategoryId)
        setChecked(newCheckedCategoryId)
        handleFilters(newCheckedCategoryId)
    }

    return categories.map((c,i)=>(
        <li key={i} className="list-unstyled">
            <input 
            onChange={handleToggle(c._id)} 
            type="checkbox" 
            className="form-check-input"
            value={checked.indexOf(c._id === -1)}/>
            <label className="form-check-label">{c.name}</label>
        </li>
    ))
}

export default Checkbox