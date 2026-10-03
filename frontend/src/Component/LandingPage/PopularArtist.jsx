import React from 'react';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import artist1 from '../../assets/pr1.jpg';
import artist2 from '../../assets/pr2.jpg';
import artist3 from '../../assets/pr3.jpg';
import artist4 from '../../assets/pr4.jpg';
import artist5 from '../../assets/pr5.jpg';
import Tuto from '../../assets/tuto.mp4';


const PopularArtist = () => {
    const artists = [
        { id: 1, name: "Artist 1", image: artist1 },
        { id: 2, name: "Artist 2", image: artist2 },
        { id: 3, name: "Artist 3", image: artist3 },
        { id: 4, name: "Artist 4", image: artist4 },
        { id: 5, name: "Artist 5", image: artist5 },
      ];

    return (
        
        <div className="px-6 py-8">
            <h1 className="text-5xl font-bold text-white text-center mb-10 ">Trending Artists Today</h1>
            <br />

            <div className="flex flex-wrap justify-center gap-8">
                {artists.map((artist) => (
                <div key={artist.id} className="flex flex-col items-center">
                    <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-60 h-60 object-cover rounded-full shadow-lg hover:scale-105"
                    />
                <p className="text-white mt-2 font-medium">{artist.name}</p>
                </div>
                ))}
            </div>
            <br /><br /><br /><br /><br /><br />
            <h1 className="text-5xl font-bold text-white text-center mb-10 ">Tutorial video </h1>
            {/* Video Section */}
            <div className="mt-16 w-full flex justify-center">
            <video
                src={Tuto}
                controls
                className="w-full max-w-4xl rounded-xl shadow-lg "
            >
                Your browser does not support the video tag.
            </video>
            </div>
        </div>

    );
};

export default PopularArtist;
