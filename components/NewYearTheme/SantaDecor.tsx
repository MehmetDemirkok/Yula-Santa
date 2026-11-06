/** Decorations for the Secret Santa page. All of it is visual only and hidden from assistive tech. */

/** Holly sprig for the top corners of the gift card. Mirror it with `-scale-x-100`. */
export function HollySprig({ className = "" }: { className?: string }) {
    return (
        <svg aria-hidden="true" viewBox="0 0 48 30" className={`pointer-events-none absolute ${className}`}>
            <path
                d="M24 15C20 9 14 5 6 5C7 8 5 10 2 11C5 13 6 15 5 18C8 17 10 18 11 21C14 18 20 17 24 15Z"
                fill="#1F7A4D"
                stroke="#14573A"
                strokeWidth="0.8"
            />
            <path
                d="M24 15C28 9 34 5 42 5C41 8 43 10 46 11C43 13 42 15 43 18C40 17 38 18 37 21C34 18 28 17 24 15Z"
                fill="#25935C"
                stroke="#14573A"
                strokeWidth="0.8"
            />
            <circle cx="20" cy="18" r="3.4" fill="#D62839" />
            <circle cx="28" cy="18" r="3.4" fill="#D62839" />
            <circle cx="24" cy="22.5" r="3.4" fill="#B61722" />
            <circle cx="19" cy="17" r="1" fill="#FFFFFF" opacity="0.8" />
            <circle cx="27" cy="17" r="1" fill="#FFFFFF" opacity="0.8" />
            <circle cx="23" cy="21.5" r="1" fill="#FFFFFF" opacity="0.8" />
        </svg>
    );
}

const TREE_LIGHTS = [
    { cx: 52, cy: 50, color: "#FFD166", delay: "0s" },
    { cx: 70, cy: 62, color: "#60A5FA", delay: "0.5s" },
    { cx: 42, cy: 84, color: "#FF4B55", delay: "0.9s" },
    { cx: 64, cy: 92, color: "#FFD166", delay: "0.3s" },
    { cx: 84, cy: 102, color: "#34D399", delay: "1.2s" },
    { cx: 30, cy: 118, color: "#60A5FA", delay: "0.7s" },
    { cx: 56, cy: 124, color: "#FF4B55", delay: "1.5s" },
    { cx: 88, cy: 132, color: "#FFD166", delay: "1s" },
];

const TREE_BAUBLES = [
    { cx: 60, cy: 72, r: 4.5, color: "#D62839" },
    { cx: 38, cy: 104, r: 5, color: "#E7B53C" },
    { cx: 76, cy: 116, r: 5.5, color: "#D62839" },
    { cx: 44, cy: 136, r: 5.5, color: "#FFFFFF" },
    { cx: 70, cy: 140, r: 4.5, color: "#E7B53C" },
];

/** A decorated evergreen with a gold star and twinkling lights. */
export function FestiveTree({ className = "" }: { className?: string }) {
    return (
        <svg aria-hidden="true" viewBox="0 0 120 172" className={`pointer-events-none absolute ${className}`}>
            <rect x="52" y="146" width="16" height="22" rx="2" fill="#7A4A25" />
            <path d="M60 58L108 150C92 158 28 158 12 150Z" fill="#14683F" />
            <path d="M60 34L96 106C82 113 38 113 24 106Z" fill="#1A7D4C" />
            <path d="M60 14L84 66C74 72 46 72 36 66Z" fill="#229A5E" />
            {/* Snow resting on each tier */}
            <path d="M60 14L71 38C66 42 63 37 60 41C57 37 54 42 49 38Z" fill="#F4F8FE" />
            <path d="M36 66C42 72 48 67 54 71C60 67 66 72 72 69C78 72 81 69 84 66C75 73 45 73 36 66Z" fill="#F4F8FE" opacity="0.9" />
            <path d="M24 106C33 113 42 107 51 112C60 107 69 113 78 110C87 113 92 109 96 106C82 114 38 114 24 106Z" fill="#F4F8FE" opacity="0.9" />
            <path d="M12 150C24 158 36 152 48 157C60 152 72 158 84 155C96 158 104 153 108 150C92 159 28 159 12 150Z" fill="#F4F8FE" opacity="0.9" />
            {TREE_BAUBLES.map((bauble) => (
                <circle key={`${bauble.cx}-${bauble.cy}`} cx={bauble.cx} cy={bauble.cy} r={bauble.r} fill={bauble.color} stroke="rgba(0,0,0,0.18)" strokeWidth="0.6" />
            ))}
            {TREE_LIGHTS.map((light) => (
                <circle
                    key={`${light.cx}-${light.cy}`}
                    className="ys-garland-bulb"
                    cx={light.cx}
                    cy={light.cy}
                    r="2.4"
                    fill={light.color}
                    style={{ animationDelay: light.delay, filter: `drop-shadow(0 0 2px ${light.color})` }}
                />
            ))}
            <path
                d="M60 1L63.5 9.5L72.5 10L65.5 15.8L67.8 24.5L60 19.7L52.2 24.5L54.5 15.8L47.5 10L56.5 9.5Z"
                fill="#FFD166"
                stroke="#B98A25"
                strokeWidth="0.8"
            />
        </svg>
    );
}

/** Three wrapped gifts in the site's crimson, evergreen and gold. */
export function GiftPile({ className = "" }: { className?: string }) {
    return (
        <svg aria-hidden="true" viewBox="0 0 120 80" className={`pointer-events-none absolute ${className}`}>
            <rect x="8" y="34" width="44" height="44" rx="3" fill="#B61722" />
            <rect x="26" y="34" width="8" height="44" fill="#FFD166" />
            <rect x="8" y="50" width="44" height="8" fill="#FFD166" />
            <path d="M30 34C24 22 12 24 15 30C17 34 25 35 30 34ZM30 34C36 22 48 24 45 30C43 34 35 35 30 34Z" fill="#FFD166" stroke="#B98A25" strokeWidth="0.8" />
            <rect x="72" y="42" width="38" height="36" rx="3" fill="#1A7D4C" />
            <rect x="87" y="42" width="8" height="36" fill="#F4F8FE" />
            <rect x="72" y="56" width="38" height="8" fill="#F4F8FE" />
            <path d="M91 42C86 32 76 33 78 38C80 42 87 43 91 42ZM91 42C96 32 106 33 104 38C102 42 95 43 91 42Z" fill="#F4F8FE" stroke="#B8C6D8" strokeWidth="0.8" />
            <rect x="46" y="56" width="30" height="22" rx="3" fill="#E7B53C" />
            <rect x="57" y="56" width="7" height="22" fill="#B61722" />
            <rect x="46" y="64" width="30" height="6" fill="#B61722" />
            <path d="M60 56C56 48 48 49 50 53C51 56 56 57 60 56ZM60 56C64 48 72 49 70 53C69 56 64 57 60 56Z" fill="#D62839" stroke="#8E101B" strokeWidth="0.8" />
        </svg>
    );
}

/**
 * A snowy ground line along the bottom of the page, with trees and gifts.
 * The front drift uses --surface-1 so it flows into the section below it.
 */
export function WinterScene() {
    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[110px] xl:h-full">
            <FestiveTree className="bottom-[20px] left-[4%] h-[92px] w-auto sm:left-[10%] lg:h-[190px] xl:bottom-[30px] xl:left-[9%] xl:h-[340px]" />
            <FestiveTree className="bottom-[26px] right-[22%] h-[58px] w-auto sm:right-[20%] lg:h-[120px] xl:bottom-[36px] xl:right-[21%] xl:h-[190px]" />
            <GiftPile className="bottom-[14px] right-[3%] h-[44px] w-auto sm:right-[8%] lg:h-[78px] xl:bottom-[22px] xl:right-[8%] xl:h-[120px]" />
            <svg viewBox="0 0 400 40" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[40px] w-full">
                <path
                    className="fill-[#E3EDF9] dark:fill-[#2A3140]"
                    d="M0 22C40 8 90 8 140 18C190 28 240 30 290 18C330 9 370 10 400 20V40H0Z"
                />
                <path
                    fill="var(--surface-1)"
                    d="M0 30C50 18 110 22 160 28C220 35 280 36 330 27C360 22 385 24 400 28V40H0Z"
                />
            </svg>
        </div>
    );
}
