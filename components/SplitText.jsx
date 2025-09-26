import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GSAPSplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);

// const SplitText = ({
//     text,
//     className = "",
//     delay = 100,
//     duration = 0.6,
//     ease = "power3.out",
//     splitType = "chars",
//     from = { opacity: 0, y: 40 },
//     to = { opacity: 1, y: 0 },
//     threshold = 0.1,
//     rootMargin = "-100px",
//     textAlign = "center",
//     tag = "p",
//     onLetterAnimationComplete,
// }) => {
//     const ref = useRef(null);
//     const animationCompletedRef = useRef(false);
//     const [fontsLoaded, setFontsLoaded] = useState(false);

//     useEffect(() => {
//         if (document.fonts.status === "loaded") {
//             setFontsLoaded(true);
//         } else {
//             document.fonts.ready.then(() => {
//                 setFontsLoaded(true);
//             });
//         }
//     }, []);

//     useGSAP(
//         () => {
//             if (!ref.current || !text || !fontsLoaded) return;
//             const el = ref.current;

//             if (el._rbsplitInstance) {
//                 try {
//                     el._rbsplitInstance.revert();
//                 } catch (_) {
//                     /* noop */
//                 }
//                 el._rbsplitInstance = null;
//             }

//             const startPct = (1 - threshold) * 100;
//             const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(
//                 rootMargin
//             );
//             const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
//             const marginUnit = marginMatch ? marginMatch[2] || "px" : "px";
//             const sign =
//                 marginValue === 0
//                     ? ""
//                     : marginValue < 0
//                     ? `-=${Math.abs(marginValue)}${marginUnit}`
//                     : `+=${marginValue}${marginUnit}`;
//             const start = `top ${startPct}%${sign}`;

//             let targets;
//             const assignTargets = (self) => {
//                 if (splitType.includes("chars") && self.chars.length)
//                     targets = self.chars;
//                 if (
//                     !targets &&
//                     splitType.includes("words") &&
//                     self.words.length
//                 )
//                     targets = self.words;
//                 if (
//                     !targets &&
//                     splitType.includes("lines") &&
//                     self.lines.length
//                 )
//                     targets = self.lines;
//                 if (!targets) targets = self.chars || self.words || self.lines;
//             };

//             const splitInstance = new GSAPSplitText(el, {
//                 type: splitType,
//                 smartWrap: true,
//                 autoSplit: splitType === "lines",
//                 linesClass: "split-line",
//                 wordsClass: "split-word",
//                 charsClass: "split-char",
//                 reduceWhiteSpace: false,
//                 onSplit: (self) => {
//                     assignTargets(self);

//                     // Set initial styles immediately to prevent flash
//                     gsap.set(targets, {
//                         ...from,
//                         backgroundImage: "linear-gradient(to bottom, #d9f99d, #84cc16, #4d7c0f)",
//                         backgroundClip: "text",
//                         webkitBackgroundClip: "text",
//                         webkitTextFillColor: "transparent",
//                         color: "transparent",
//                         visibility: "visible",
//                     });

//                     const tween = gsap.to(targets, {
//                         ...to,
//                         duration,
//                         ease,
//                         stagger: delay / 1000,
//                         scrollTrigger: {
//                             trigger: el,
//                             start,
//                             once: true,
//                             fastScrollEnd: true,
//                             anticipatePin: 0.4,
//                         },
//                         onStart: () => {
//                             // Ensure gradient properties are maintained during animation
//                             gsap.set(targets, {
//                                 webkitBackgroundClip: "text",
//                                 backgroundClip: "text",
//                                 webkitTextFillColor: "transparent",
//                             });
//                         },
//                         onComplete: () => {
//                             // Final ensure gradient text is visible
//                             gsap.set(targets, {
//                                 webkitBackgroundClip: "text",
//                                 backgroundClip: "text",
//                                 webkitTextFillColor: "transparent",
//                                 color: "transparent",
//                             });
//                             animationCompletedRef.current = true;
//                             onLetterAnimationComplete?.();
//                         },
//                         willChange: "transform, opacity",
//                         force3D: true,
//                     });
//                     return tween;
//                 },
//             });

//             el._rbsplitInstance = splitInstance;

//             return () => {
//                 ScrollTrigger.getAll().forEach((st) => {
//                     if (st.trigger === el) st.kill();
//                 });
//                 try {
//                     splitInstance.revert();
//                 } catch (_) {
//                     /* noop */
//                 }
//                 el._rbsplitInstance = null;
//             };
//         },
//         {
//             dependencies: [
//                 text,
//                 delay,
//                 duration,
//                 ease,
//                 splitType,
//                 JSON.stringify(from),
//                 JSON.stringify(to),
//                 threshold,
//                 rootMargin,
//                 fontsLoaded,
//                 onLetterAnimationComplete,
//             ],
//             scope: ref,
//         }
//     );

//     const renderTag = () => {
//         const style = {
//             textAlign,
//             overflow: "hidden",
//             display: tag === "span" ? "inline" : "inline-block",
//             whiteSpace: "normal",
//             wordWrap: "break-word",
//             willChange: "transform, opacity",
//             // Initially hide the text to prevent flash
//             visibility: fontsLoaded ? "visible" : "hidden",
//         };
//         const classes = `split-parent ${className}`;
//         switch (tag) {
//             case "h1":
//                 return (
//                     <h1 ref={ref} style={style} className={classes}>
//                         {text}
//                     </h1>
//                 );
//             case "h2":
//                 return (
//                     <h2 ref={ref} style={style} className={classes}>
//                         {text}
//                     </h2>
//                 );
//             case "h3":
//                 return (
//                     <h3 ref={ref} style={style} className={classes}>
//                         {text}
//                     </h3>
//                 );
//             case "h4":
//                 return (
//                     <h4 ref={ref} style={style} className={classes}>
//                         {text}
//                     </h4>
//                 );
//             case "h5":
//                 return (
//                     <h5 ref={ref} style={style} className={classes}>
//                         {text}
//                     </h5>
//                 );
//             case "h6":
//                 return (
//                     <h6 ref={ref} style={style} className={classes}>
//                         {text}
//                     </h6>
//                 );
//             default:
//                 return (
//                     <p ref={ref} style={style} className={classes}>
//                         {text}
//                     </p>
//                 );
//         }
//     };
//     return renderTag();
// };

// export default SplitText;

const SplitText = ({
    text,
    className = "",
    delay = 100,
    duration = 0.6,
    ease = "power3.out",
    splitType = "chars",
    from = { opacity: 0, y: 40 },
    to = { opacity: 1, y: 0 },
    threshold = 0.1,
    rootMargin = "-100px",
    textAlign = "center",
    tag = "p",
    gradient = false, // 👈 new prop
    onLetterAnimationComplete,
}) => {
    const ref = useRef(null);
    const animationCompletedRef = useRef(false);
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        if (document.fonts.status === "loaded") {
            setFontsLoaded(true);
        } else {
            document.fonts.ready.then(() => {
                setFontsLoaded(true);
            });
        }
    }, []);

    useGSAP(
        () => {
            if (!ref.current || !text || !fontsLoaded) return;
            const el = ref.current;

            if (el._rbsplitInstance) {
                try {
                    el._rbsplitInstance.revert();
                } catch (_) {}
                el._rbsplitInstance = null;
            }

            const startPct = (1 - threshold) * 100;
            const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(
                rootMargin
            );
            const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
            const marginUnit = marginMatch ? marginMatch[2] || "px" : "px";
            const sign =
                marginValue === 0
                    ? ""
                    : marginValue < 0
                    ? `-=${Math.abs(marginValue)}${marginUnit}`
                    : `+=${marginValue}${marginUnit}`;
            const start = `top ${startPct}%${sign}`;

            let targets;
            const assignTargets = (self) => {
                if (splitType.includes("chars") && self.chars.length)
                    targets = self.chars;
                if (
                    !targets &&
                    splitType.includes("words") &&
                    self.words.length
                )
                    targets = self.words;
                if (
                    !targets &&
                    splitType.includes("lines") &&
                    self.lines.length
                )
                    targets = self.lines;
                if (!targets) targets = self.chars || self.words || self.lines;
            };

            const splitInstance = new GSAPSplitText(el, {
                type: splitType,
                smartWrap: true,
                autoSplit: splitType === "lines",
                linesClass: "split-line",
                wordsClass: "split-word",
                charsClass: "split-char",
                reduceWhiteSpace: false,
                onSplit: (self) => {
                    assignTargets(self);

                    // 👇 apply gradient only if asked
                    if (gradient) {
                        gsap.set(targets, {
                            ...from,
                            backgroundImage:
                                "linear-gradient(to bottom, #d9f99d, #84cc16, #4d7c0f)",
                            backgroundClip: "text",
                            webkitBackgroundClip: "text",
                            webkitTextFillColor: "transparent",
                            color: "transparent",
                            visibility: "visible",
                        });
                    } else {
                        gsap.set(targets, { ...from, visibility: "visible" });
                    }

                    const tween = gsap.to(targets, {
                        ...to,
                        duration,
                        ease,
                        stagger: delay / 1000,
                        scrollTrigger: {
                            trigger: el,
                            start,
                            once: true,
                            fastScrollEnd: true,
                            anticipatePin: 0.4,
                        },
                        onComplete: () => {
                            if (gradient) {
                                gsap.set(targets, {
                                    webkitBackgroundClip: "text",
                                    backgroundClip: "text",
                                    webkitTextFillColor: "transparent",
                                    color: "transparent",
                                });
                            }
                            animationCompletedRef.current = true;
                            onLetterAnimationComplete?.();
                        },
                        willChange: "transform, opacity",
                        force3D: true,
                    });
                    return tween;
                },
            });

            el._rbsplitInstance = splitInstance;

            return () => {
                ScrollTrigger.getAll().forEach((st) => {
                    if (st.trigger === el) st.kill();
                });
                try {
                    splitInstance.revert();
                } catch (_) {}
                el._rbsplitInstance = null;
            };
        },
        {
            dependencies: [
                text,
                delay,
                duration,
                ease,
                splitType,
                JSON.stringify(from),
                JSON.stringify(to),
                threshold,
                rootMargin,
                fontsLoaded,
                gradient,
                onLetterAnimationComplete,
            ],
            scope: ref,
        }
    );

    const style = {
        textAlign,
        overflow: "hidden",
        display: tag === "span" ? "inline" : "inline-block",
        whiteSpace: "normal",
        wordWrap: "break-word",
        willChange: "transform, opacity",
        visibility: fontsLoaded ? "visible" : "hidden",
    };
    const classes = `split-parent ${className}`;

    const Tag = tag;
    return (
        <Tag ref={ref} style={style} className={classes}>
            {text}
        </Tag>
    );
};

export default SplitText;
