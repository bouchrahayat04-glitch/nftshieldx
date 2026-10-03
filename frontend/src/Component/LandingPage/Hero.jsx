import React from 'react'
import HeroImg from "../../assets/nft3.jpg"
import HerImg from "../../assets/nft4.jpg"
import HeriImg from "../../assets/nft5.jpg"
import Button from '../reuseableComponent/Button';
import { Link } from 'react-router-dom';
import {motion} from 'framer-motion'

const Hero = () => {
    return (
       <div className="flex  justify-between text-center  px-4 py-12 lg:px-16 lg:py-16 gap-4  text-white">
        
        {/* Text Section */}
        <aside className="w-full lg:w-1/2 text-center lg:text-left mb-20 lg:mb-3">
          <h1 className="leading-tight mb-0 text-balance" style={{ fontSize: "55px", fontWeight: "bold" }}>
          <br />
            Welcome to NFTShieldX. Discover, buy, and sell NFTs with confidence.
            <br/>
          </h1>
          <h2 style={{ fontSize: "25px", fontWeight: "bold" }}>a secure, refined marketplace where digital art meets trust and authenticity.</h2>
          <br /><br /><br />

          
          <Link to="/discovery">
            <Button 
              bg="bg-gradient-to-l from-blue-400 via-purple-600 to-pink-500" 
              textColor="text-white" 
              btnText="Discover"
              className="py-3 px-6 rounded-full hover:bg-gradient-to-r mr-4 text-xl font-bold"
            />
          </Link>
          <Link to="/mint">
            <Button 
              border="border "
              bg="bg-transparent" 
              textColor="text-white" 
              btnText="Create"
              className="py-3 px-8 rounded-full hover:bg-blue-400 hover:text-black text-xl font-bold"
            />
          </Link>

          
          
        </aside>
  
        {/* Image Section */}
        <motion.img
            src={HeroImg} 
            alt="NFT Hero"
            className="w-1/6 lg:w-1/6 rounded-full 
             shadow-xl transform transition duration-500
              hover:scale-105 mb-2"
            animate={{ y: [0, -150, 0],  // Adding slight bounce effect
                
              }}
            transition={{
                duration:3,
                ease:'easeInOut',
                repeat:Infinity,
            }}/>

          <motion.img
            src={HerImg} 
            alt="NFT Hero"
            className="w-1/6 lg:w-1/6
             rounded-full shadow-xl transform transition 
            duration-500 hover:scale-105 mb-2" 
            animate={{ y: [0, -150, 0],  // Adding slight bounce effect
                
              }}
            transition={{
                duration:3,
                ease:'easeInOut',
                repeat:Infinity,
            }}/>

            <motion.img
            src={HeriImg} 
            alt="NFT Hero" 
            className="w-1/6 lg:w-1/6 rounded-full shadow-xl transform transition duration-500 hover:scale-105 mb-2"
            animate={{ y: [0, -150, 0],  // Adding slight bounce effect
                
              }}
            transition={{
                duration:3,
                ease:'easeInOut',
                repeat:Infinity,
            }}/>
        
      </div>
      
    );
  };

export default Hero