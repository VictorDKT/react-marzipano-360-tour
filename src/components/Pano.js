import React, { useEffect, useRef, useState } from 'react';
import Marzipano from 'marzipano';
import Info from "./info.png";
import Link from "./link.png";
import './Pano.css';

function Pano(props) {
    const [infoOpen, setInfoOpen] = useState("");
    const [pageSelected, setPageSelected] = useState(0);
    const [viewer, setViewer] = useState();
    let pano = useRef();
    const [boxWidth, setBoxWidth] = useState(0);
    const [boxHeight, setBoxHeight] = useState(0);

    useEffect(()=>{
        window.addEventListener("resize", ()=>{
            setBoxHeight(document.getElementById("box-360").clientHeight);
            setBoxWidth(document.getElementById("box-360").clientWidth);
        })
        setBoxHeight(document.getElementById("box-360").clientHeight);
        setBoxWidth(document.getElementById("box-360").clientWidth);
        const {
            data: {
                settings: { mouseViewMode },
                scenes,
            },
        } = props;
        const viewerOpts = {
            controls: { mouseViewMode },
        };
        const viewer = new Marzipano.Viewer(pano, viewerOpts);
        const e = document.getElementById("spots-container")
        var child = e.lastElementChild; 
        while (child) {
            e.removeChild(child);
            child = e.lastElementChild;
        }
        const panoScenes = scenes.map((data, idx) => {
            const { link, initialViewParameters, levels, faceSize, linkHotspots, type, width } = data;
            var limiter = type === "unique" ? Marzipano.RectilinearView.limit.traditional(1024, 100*Math.PI/180) : Marzipano.RectilinearView.limit.traditional(faceSize, 100*Math.PI/180, 120*Math.PI/180);
            var view = type === "unique" ? new Marzipano.RectilinearView({ yaw: Math.PI }, limiter) : new Marzipano.RectilinearView(initialViewParameters, limiter);
            var geometry = type === "unique" ? new Marzipano.EquirectGeometry([{ width: width }]) : new Marzipano.CubeGeometry(levels);

            const scene = viewer.createScene({
                source: type === "unique" ? Marzipano.ImageUrlSource.fromString(
                        link + ".jpg"
                    ) : Marzipano.ImageUrlSource.fromString(
                    link + "/{z}/{f}/{y}/{x}.jpg",
                    { cubeMapPreviewUrl: link + "/preview.jpg" }
                ),
                geometry: geometry,
                view: view,
                pinFirstLevel: true,
                hotspots: linkHotspots
            });
    
            data.linkHotspots.forEach(function(hotspot, index) {
                const container = document.getElementById('spots-container');
                const element = document.createElement("img");
                element.src= Link;
                element.classList.add("info-spot-header-image")
                element.id = "spot-"+idx+"-"+index
                element.onclick = ()=>{
                    let sceneIndex;
                    scenes.forEach((scene, index)=>{
                        if(scene.id === hotspot.target) {
                            sceneIndex = index;
                        }
                    })
                    panoScenes[sceneIndex].scene.switchTo();
                };
                container.appendChild(element)
                scene.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
            });

            data.infoHotspots.forEach(function(hotspot, index) {
                const container = document.getElementById('spots-container');               
                const element = document.createElement("div");
                element.id = "text-spot-"+idx+"-"+index;
                element.style.width = "300px"
                
                const header = document.createElement("div");
                header.classList.add("info-spot-header")
                if(idx+"-"+index === infoOpen) {
                    header.classList.add("info-spot-header-open") 
                }
                header.id = "info-spot-header";
                
                const headerImage = document.createElement("img");
                headerImage.src= Info;
                headerImage.classList.add("info-spot-header-image")

                const headerImageBox = document.createElement("div");
                headerImageBox.appendChild(headerImage)
                headerImageBox.classList.add("info-spot-header-image-box")
                headerImageBox.onclick = () => {
                    setInfoOpen(idx+"-"+index)
                    setPageSelected(idx)
                }

                if(idx+"-"+index === infoOpen) {
                    const headerText = document.createElement("div");
                    headerText.innerHTML = hotspot.title
                    headerText.classList.add("info-spot-header-title")
                    headerText.classList.add("info-spot-header-title-open") 

                    const headerCloseButton = document.createElement("div");
                    headerCloseButton.innerHTML = "X";
                    headerCloseButton.classList.add("info-spot-header-close-button");
                    headerCloseButton.onclick = ()=>{
                        setInfoOpen(null)
                    }

                    const bodyText = document.createElement("div");
                    bodyText.innerHTML = hotspot.text;
                    bodyText.classList.add("info-spot-body-text");

                    header.appendChild(headerImageBox)
                    header.appendChild(headerText)
                    header.appendChild(headerCloseButton)
                    
                    element.appendChild(header)
                    element.appendChild(bodyText)
                } else {
                    header.appendChild(headerImageBox)
                    element.appendChild(header)
                }
                
                container.appendChild(element)
                scene.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
            });

            return {
                data: data,
                scene: scene,
                view: view,
            };
        });

        panoScenes[pageSelected].scene.switchTo();
        setViewer(viewer)
    }, [boxHeight, boxWidth])

    useEffect(()=>{
        const {data: {scenes}} = props;
        
        if(viewer) {
            scenes.forEach((data, idx)=>{
                data.infoHotspots.forEach(function(hotspot, index) {
                    viewer._scenes[idx].hotspotContainer().listHotspots().forEach(h=>{
                        if(h.domElement().id.includes("text-spot")) {
                            viewer._scenes[idx].hotspotContainer().destroyHotspot(h)
                        }
                    });

                    const container = document.getElementById('spots-container');              
                    const element = document.createElement("div");
                    element.id = "text-spot-"+idx+"-"+index;
                    element.style.width = "300px"
                    
                    const header = document.createElement("div");
                    header.classList.add("info-spot-header")
                    if(idx+"-"+index === infoOpen) {
                        header.classList.add("info-spot-header-open") 
                    }
                    header.id = "info-spot-header";
                    
                    const headerImage = document.createElement("img");
                    headerImage.src= Info;
                    headerImage.classList.add("info-spot-header-image")

                    const headerImageBox = document.createElement("div");
                    headerImageBox.appendChild(headerImage)
                    headerImageBox.classList.add("info-spot-header-image-box")
                    headerImageBox.onclick = () => {
                        setInfoOpen(idx+"-"+index)
                        setPageSelected(idx)
                    }

                    if(idx+"-"+index === infoOpen) {
                        const headerText = document.createElement("div");
                        headerText.innerHTML = hotspot.title
                        headerText.classList.add("info-spot-header-title")
                        headerText.classList.add("info-spot-header-title-open") 

                        const headerCloseButton = document.createElement("div");
                        headerCloseButton.innerHTML = "X";
                        headerCloseButton.classList.add("info-spot-header-close-button");
                        headerCloseButton.onclick = ()=>{
                            setInfoOpen(null)
                        }

                        const bodyText = document.createElement("div");
                        bodyText.innerHTML = hotspot.text;
                        bodyText.classList.add("info-spot-body-text");

                        header.appendChild(headerImageBox)
                        header.appendChild(headerText)
                        header.appendChild(headerCloseButton)
                        
                        element.appendChild(header)
                        element.appendChild(bodyText)
                    } else {
                        header.appendChild(headerImageBox)
                        element.appendChild(header)
                    }
                    
                    container.appendChild(element)
                    viewer._scenes[idx].hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
                });
            })
        }
    }, [props, infoOpen, pageSelected])
    
    return (
        <div id="box-360" style={{width:"100%", height: "100%"}}>
            <div style={{width: boxWidth, height: boxHeight}} className="pano-container" id="pano" ref={ref => pano = ref }>
                <div id="spots-container"></div>
            </div>
        </div>
    )
};

export default Pano;