import React from 'react';
import Typical from 'react-typical';

const TypingHeader = () => {
  return (
    <h1 className='text-5xl text-white font-bold '>
        <Typical
        steps={['Discover our collection' , 2000,
          'Own, trade, and collect NFTs securely.',2000,
          'Buy Unique Art...' , 2000,
        ]}
        loop={1}
        wrapper="span"

        />
    </h1>
  )
}

export default TypingHeader