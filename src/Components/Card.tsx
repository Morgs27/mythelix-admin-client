import './card.css'

// Import Card Overlay Image
import overlay from "../assets/card-design.png"

// Import Type Icons
import Dragon from "../assets/Dragon.png"
import Demon from "../assets/Demon.png"
import Faerie from "../assets/Faerie.png"
import Giant from "../assets/Giant.png"
import Goblin from "../assets/Goblin.png"
import Owl from "../assets/Owl.png"
import Phoenix from "../assets/Phoenix.png"
import Unicorn from "../assets/Unicorn.png"
import Vampire from "../assets/Vampire.png"
import Warewolf from "../assets/Warewolf.png"
import Wizard from "../assets/Wizard.png"
import Zombie from "../assets/Zombie.png"
import { useRef } from 'react'

const typeToImageSrc: Record<string,string> = {
    Dragon, Demon, Faerie, Giant, Goblin, Owl, Phoenix, Unicorn, Vampire, Warewolf, Wizard, Zombie
}

type cardProps = {
    imageSrc : string,
    name : string,
    special : string,
    type: string,
    contribution: number,
    cost: number,
}   


const Card = ({imageSrc, cost, name, contribution, type,special}: cardProps) => {

    const renderContribution = () => {
        switch (contribution){
            case 1:
                return (
                    <>
                    <div className="center  "></div>
                    <div className="side left">
                        <div className = "hide"></div>
                        <div className = "hide"></div>
                    </div>
                    <div className="side right">
                        <div className = "hide"></div>
                        <div className = "hide"></div>
                    </div>
                    </>
                )
            case 2:
                return (
                    <>
                    <div className="center hide "></div>
                    <div className="side left">
                        <div className = "hide"></div>
                        <div className = ""></div>
                    </div>
                    <div className="side right">
                        <div className = "hide"></div>
                        <div className = ""></div>
                    </div>
                    </>
                )
            case 3:
                return (
                    <>
                    <div className="center "></div>
                    <div className="side left">
                        <div className = "hide"></div>
                        <div className = ""></div>
                    </div>
                    <div className="side right">
                        <div className = "hide"></div>
                        <div className = ""></div>
                    </div>
                    </>
                )
            case 4: 
                return (
                    <>
                    <div className="center hide "></div>
                    <div className="side left">
                        <div className = ""></div>
                        <div className = ""></div>
                    </div>
                    <div className="side right">
                        <div className = ""></div>
                        <div className = ""></div>
                    </div>
                    </>
                )
            case 5: 
                return (
                    <>
                    <div className="center"></div>
                    <div className="side left">
                        <div></div>
                        <div></div>
                    </div>
                    <div className="side right">
                        <div></div>
                        <div></div>
                    </div>
                    </>
                )
        }
    }

    const card = useRef<HTMLDivElement>(null);
    let bounds: DOMRect | undefined;

    
    function rotateToMouse(e: any) {

        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const leftX = mouseX - bounds.x;
        const topY = mouseY - bounds.y;

        const center = {
        x: leftX - bounds.width / 2,
        y: topY - bounds.height / 2
        };

        const distance = Math.sqrt(center.x ** 2 + center.y ** 2);
    
        card.current.style.transform = `
        scale3d(1.07, 1.07, 1.07)
        rotate3d(
            ${center.y / 100},
            ${-center.x / 100},
            0,
            ${Math.log(distance) * 2}deg
        )
        `;
    
        card.current.querySelector(".glow").style.backgroundImage = `
        radial-gradient(
            circle at
            ${center.x * 2 + bounds.width / 2}px
            ${center.y * 2 + bounds.height / 2}px,
            #ffffff20,
            #0000000f
        )
        `;
    }

    const mouseEnter = () => {
        bounds = card.current?.getBoundingClientRect();
        document.addEventListener("mousemove", rotateToMouse);
     
        console.log('mouse enter')
    }

    const mouseLeave = () => {  
        document.removeEventListener("mousemove", rotateToMouse);
        card.current.style.transform = "";
        card.current.style.background = "";
        card.current.querySelector(".glow").style.backgroundImage = "";

        console.log('mouse leave')
    }

    const focusCard = () => {
        card.current?.classList.add('focus')
    }
    
    return(
        <div className={`card ${special} ${type}`} ref={card} 
        onMouseEnter={() => mouseEnter()} 
        onMouseLeave={() => mouseLeave()}
        onClick={() => focusCard()}
        >

           
            <div className="border"></div>
            <img src={imageSrc} loading = {"lazy"} className = "image"></img>
            <img src={overlay}  loading = {"lazy"}  alt="" className="imageOverlay" />
            <div className="glow"></div>
            <div className="overlay">
                <div className="top">
                    <div className="cost"><div className="text">{cost}</div></div>
                    <div className="contribution">
                       {renderContribution()}
                    </div>
                </div>
                <div className="name">
                    {
                        special != 'null' ? 
                        <div className={"alteration " + special}>{special.toUpperCase()}</div>
                        : <></>
                    }
                    {name.toLocaleUpperCase()}
                </div>
                
                <div className="description">Battlecry: Some extra text, or some other thext haha. and another line. bla blaShoot 3 bolts of frost at all enemy units dealing 3 damage.</div>
                <div className="bottom">
                    <div className="defence">5</div>
                    <div className="class">
                        <img src={typeToImageSrc[type]} alt={type} />
                        <div>{type.toUpperCase()}</div>
                        
                    </div>
                    <div className="attack">3</div>
                </div>
            </div>
        </div>
    )
}

export default Card