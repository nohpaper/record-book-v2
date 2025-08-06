import Group from "./assets/component/Group.tsx";
import List from "./assets/component/List.tsx";
import {useMobileTabStore} from "./assets/store/All.ts";

function App() {
    const mobileTabView = useMobileTabStore((state) => state.tab);
    const isMobileView = useMobileTabStore((state) => state.isView);
  return (
    <>
        <div className="
            min-w-[100vw] min-h-[100vh] flex flex-col justify-between items-center pt-[5.99vw] px-[3.125vw] bg-linear-185 from-[rgba(214,239,217,.5)]] via-[rgba(239,222,214,.5)] to-[rgba(203,218,239,.5)]
            md:flex-row md:items-start md:justify-center md:pt-[10.938vw]
        ">
            <Group></Group>
            <List></List>
            <div className="w-[100%] fixed bottom-[2.604vw] left-0 px-[3.125vw] box-border md:hidden">
                <ul className="
                   w-[100%] flex border border-[#E9E9E9] rounded-[5.208vw] bg-[#fff] shadow-lg
                ">
                    {mobileTabView.map((element, index) => {
                        return (<li key={index} className="w-[50%] mx-[0.781vw] my-[0.521vw] rounded-[5.208vw] overflow-hidden">
                            <button type="button" className={`w-[100%] block  py-[0.781vw] overflow-hidden ${element.isView ? "text-[#fff] bg-[#7F7F7F]" : "text-[#3F3F3F] bg-transparent"} text-center text-[1.563vw]`} onClick={() => {
                                isMobileView(element.id);
                            }}>
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
