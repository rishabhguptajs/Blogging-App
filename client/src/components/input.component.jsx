import React, { useState, forwardRef } from 'react'

const InputBox = forwardRef(({ name, type, id, value, placeholder, icon }, ref) => {
    const [passwordVisible, setPasswordVisible] = useState(false)

    return (
        <div className='relative w-[100%] mb-4'>
            <input 
                name={name}
                type={
                    type === "password" ? (passwordVisible ? "text" : "password") : type
                }
                id={id}
                defaultValue={value}
                placeholder={placeholder}
                className='input-box'
                ref={ref}
            />

            <i className={"fi " + icon + " input-icon"}></i>

            {
                type === "password" ? (
                    <i className={"fi fi-rr-eye" + (!passwordVisible ? "-crossed" : "") + " input-icon left-[auto] right-4 cursor-pointer"}
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    ></i>
                ) : ""
            }
        </div>
    )
})

export default InputBox
