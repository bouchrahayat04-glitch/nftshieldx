import React from 'react'

const Button = ({ border, bg, textColor, btnText, className }) => {
    return (
      <button className={`py-2 px-4 min-w-28 rounded-full shadow-md 
       transition-all ease-in-out ${border} ${bg} ${textColor} 
       ${className} `}>
        {btnText}
      </button>
    );
  };
  
  export default Button;
  