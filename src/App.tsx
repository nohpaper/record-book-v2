import Group from "./assets/component/Group.tsx";
import List from "./assets/component/List.tsx";
import {useState} from "react";

function App() {
    const [mobileTabView, setMobileTabView] = useState([
        {
            koreaName:"오늘의 내역",
            iconURL:"",
            isView:true,
        },
        {
            koreaName:"모아 보기",
            iconURL:"",
            isView:false,
        },
    ])
  return (
    <>
        <div className="
            min-w-[100vw] min-h-[100vh] flex flex-col justify-center items-center pt-[10.938vw] bg-linear-185 from-[rgba(214,239,217,.5)]] via-[rgba(239,222,214,.5)] to-[rgba(203,218,239,.5)]
            md:flex-row md:items-start
        ">
            <Group></Group>
            <List></List>
            <div className="w-[100%] px-[30px] box-border md:hidden">
                <ul className="
                   flex rounded-[40px] bg-[#fff]
                ">
                    {mobileTabView.map((element, index) => {
                        return (<li key={index} className="w-[50%] mx-[6px] my-[4px] rounded-[40px] overflow-hidden">
                            <button type="button" className={`w-[100%] block  py-[6px] overflow-hidden ${element.isView ? "text-[#fff] bg-[#7F7F7F]" : "text-[#3F3F3F] bg-transparent"} text-center text-[12px]`}>
                                <span>{element.koreaName}</span>
                            </button>
                        </li>)
                    })}
                </ul>
            </div>
        </div>
    </>
  )
}

export default App
