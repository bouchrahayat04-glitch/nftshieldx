import React from 'react';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import NFTCard from '../reuseableComponent/NFTCard';
import { nfts } from '../../utils';

const TrendingNFT = () => {
    var settings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 4,
        initialSlide: 0,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    initialSlide: 2
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    };

    return (
        
        <div className="px-6 py-8">
            <br/><br/>
            <h1 className="text-5xl font-bold text-white text-center mb-6">Popular this week</h1>
            <br />
            <div className="carousel-container p-16 ">
                <Slider {...settings}  className="space-x-2">
                    {nfts.map((nft)=> (
                        <div key={nft.id}>
                             <NFTCard nft={nft}/>

                        </div>
                    ))}
            
                   
                </Slider>
            </div>
        </div>
    );
};

export default TrendingNFT;
