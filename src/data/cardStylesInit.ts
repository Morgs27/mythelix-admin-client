import cardStyles from "./cardStyles.json";


const initCardStyles = () => {

    // Generate CSS dynamically
    let css = "";

    let alterationStyles = cardStyles[0];

    console.log(alterationStyles)

    let typeStyles = cardStyles[1];

    for (const alterationType in alterationStyles) {
        var gradient = alterationStyles[alterationType].gradient.join(", ");

        console.log(alterationStyles[alterationType].solid[0]);

        css += `
            .card.${alterationType}::before {
            background-image: linear-gradient(var(--rotate), ${gradient});
            }
            .alteration.${alterationType} {
                background-image: linear-gradient(var(--rotate), ${alterationStyles[alterationType].solid[0]}, ${alterationStyles[alterationType].solid[0]});
            }
        `;

        
    }

    for (const cardType in typeStyles) {

        var colour = typeStyles[cardType];

        css += `
            .card.${cardType}:hover {
                box-shadow: 0 2px 0 0 ${colour};
            }
        `;

    }



    console.log("CSS: ", css);

    // Create style element
    const style = document.createElement("style");
    style.innerHTML = css;
    document.head.appendChild(style);

}

export default initCardStyles;