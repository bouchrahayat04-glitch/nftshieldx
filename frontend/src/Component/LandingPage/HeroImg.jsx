import React from 'react'
import {motion} from 'framer-motion'
import HeraImg from "../../assets/nft3.jpg"
import HerImg from "../../assets/nft4.jpg"
import HeriImg from "../../assets/nft5.jpg"

const HeroImg = () => {
  return (
    <div>
        <motion.img
            src={HeraImg} 
            alt="NFT Hero"
            className="w-1/6 lg:w-1/6 rounded-full 
             shadow-xl transform transition duration-500
              hover:scale-105 mb-2"
            animate={{y:[0,-20,0],}}
            transition={{
                duration:2,
                ease:'easeInOut',
                repeat:Infinity,
            }}


        />
    </div>
  )
}

export default HeroImg

//i can use this code to make animated images