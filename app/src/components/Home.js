import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import axios from 'axios';

const videos = [
    '/assets/video1.mp4',
    '/assets/video2.mp4',
    '/assets/video3.mp4',
    '/assets/video4.mp4'
];

function Home() {
    const navigate = useNavigate();
    const [previewProducts, setPreviewProducts] = useState([]);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

    // Rotate videos every 8 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentVideoIndex(prevIndex => (prevIndex + 1) % videos.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);


    useEffect(() => {
        // Fetch a few products for the "Fresh from the Loom" section
        const fetchPreview = async () => {
            try {
                const res = await axios.get('/api/products');
                // Take first 3 products
                setPreviewProducts(res.data.slice(0, 3));
            } catch (err) {
                console.error("Failed to fetch preview products", err);
            }
        };
        fetchPreview();
    }, []);

    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero">
                {/* Background Video Carousel */}
                <div className="hero-video-container">
                    {/* We render all videos but only show the active one to allow preloading/smooth transition if possible, 
                        or just swap source. For smoother crossfade, having multiple video elements is better but heavier. 
                        Let's try swapping source with a fade animation key. */}
                    <video 
                        key={videos[currentVideoIndex]} 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className="hero-video fade-in"
                    >
                        <source src={videos[currentVideoIndex]} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <div className="hero-overlay"></div>
                </div>

                <div className="hero-content">
                    <span className="hero-subtitle">Authentic Indian Heritage</span>
                    <h1 className="hero-title">Discover Kala Bazzar</h1>
                    <div className="hero-box">
                        <h2>Where Tradition Meets Modernity</h2>
                        <p>Explore our curated collection of authentic Indian traditional items, handcrafted by skilled artisans and brought to you through our innovative e-commerce platform.</p>
                        <div className="hero-buttons">
                            <button className="btn-primary" onClick={() => navigate('/marketplace')}>Explore Collection &rarr;</button>
                            <button className="btn-secondary" onClick={() => navigate('/signup')}>Join as Artisan &rarr;</button>
                            <button className="btn-accent" onClick={() => navigate('/marketplace')}>3D Bazaar &rarr;</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Preview / Market Place Preview */}
            <section className="featured-section">
                <div className="section-header">
                    <h2>Fresh from the Loom</h2>
                    <Link to="/marketplace" className="view-all-link">View All Products &rarr;</Link>
                </div>
                
                <div className="preview-grid">
                    {previewProducts.length > 0 ? previewProducts.map(product => (
                        <div key={product._id} className="preview-card" onClick={() => navigate('/marketplace')}>
                            <div className="preview-img-wrapper">
                                <img src={product.imageUrl || 'https://via.placeholder.com/300'} alt={product.name} />
                            </div>
                            <div className="preview-info">
                                <h3>{product.name}</h3>
                                <p>{product.category}</p>
                                <span className="price">${product.price}</span>
                            </div>
                        </div>
                    )) : (
                        <p>Loading curated treasures...</p>
                    )}
                </div>
            </section>

             {/* Call to Action Section */}
             <section className="cta-section">
                <div className="cta-content">
                    <h2>Empowering Artisans, Connecting Cultures</h2>
                    <p>Join thousands of creators and collectors in India's most vibrant creative ecosystem.</p>
                    <div className="cta-buttons">
                        <Link to="/signup" className="btn-large">Start Your Journey</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
