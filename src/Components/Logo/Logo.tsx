import logo from '../../assets/logo-white.png'; // Import the logo image

import './logo.css'; // Import the loader styles
import logoAnimation from '../../assets/logo-animation.png'; // Import the loader image
import { useEffect, useRef, useState } from 'react';

const Logo = () => {

    // Add intersection observer to logo
    const logoContainerRef = useRef<HTMLDivElement>(null);
    const logoRef = useRef<HTMLImageElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    const logoAnimationFrames = 52;

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            {
                root: null,
                rootMargin: "0px",
                threshold: 0.5
            }
        );
        if (logoContainerRef.current) {
            observer.observe(logoContainerRef.current); 
        }
    }, []);

    useEffect(() => {
        if (isVisible) {
            console.log('here')
            // Run an animation to move the logo back by 81.1px every 100ms 53 times
            let i = 1;
            const interval = setInterval(() => {
                // Stop the animation after 53 frames
                if (i === logoAnimationFrames) {
                    clearInterval(interval);
                }
                if (logoRef.current) {
                    logoRef.current.style.transform = `translateX(-${(i * 81.1) + 81.1}px)`;
                    i++;
                }
            }, 30);
        }
    }, [isVisible]);


    return (
        <>
        {/* <img src={logo} alt="Logo" className='logo' /> */}
        <div ref = {logoContainerRef} className="logoContainer">
            <img ref = {logoRef} src={logoAnimation} alt="Logo" className='logo' />
        </div>
        </>
    )
}

export default Logo;