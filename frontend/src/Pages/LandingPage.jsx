import React from 'react'
import Layout from '../Component/layout/Layout'
import Hero from '../Component/LandingPage/Hero'
import TrendingNFT from '../Component/LandingPage/TrendingNFT'
import PopularArtist from '../Component/LandingPage/PopularArtist'

const LandingPage = () => {
  return (
    <Layout>
      <Hero/>
      <TrendingNFT/>
      <PopularArtist/>

    </Layout>
  )
}

export default LandingPage