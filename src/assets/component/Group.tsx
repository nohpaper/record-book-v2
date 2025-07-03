import { useDateGroupStore } from "../store/Group.ts";
import {useActivePaletteStore, useCategoryStore} from "../store/All.ts";
import {useState} from "react";

interface BigGroup {
    koreaName: string;
    isActive: boolean;
}
export default function Group(){
    //ALL.tsx
    const activePalette = useActivePaletteStore((state) => state.palette);
    const category = useCategoryStore((state) => state.list);

    //Group.tsx
    const dateGroup = useDateGroupStore((state) => state.total);

    const [bigGroup, setBigGroup] = useState<BigGroup[]>([
        {
            koreaName: "날짜순",
            isActive:true,
        },
        {
            koreaName: "카테고리순",
            isActive:false,
        },
    ]);


    //들어오자마자, 월별 확인, ㅇ

    return (
        <div className="mr-[1.042vw]">
            {/* 탭 */}
            <ul className="flex gap-[0.521vw]">
                {bigGroup.map((element, index) => {
                    return (<li key={index} className={`px-[1.042vw] py-[0.625vw] rounded-[2.083vw] shadow-lg text-[0.833vw] ${element.isActive ? "text-[#fff] bg-[#FF5858]" : "text-[#000] bg-[#fff]"}`}>
                        <button type="button" className="cursor-pointer" onClick={()=>{
                            const copyBigGroup = bigGroup.map((item)=>{
                                item.isActive = false;
                                if(element === item){
                                    item.isActive = !item.isActive;
                                }
                                return item
                            })

                            setBigGroup(copyBigGroup);
                        }}>{element.koreaName}</button>
                    </li>)
                })}
            </ul>
            {/* 그룹 wrap */}
            <div className="pt-[1.25vw]">
                {/* 날짜순 */}
                <ul className={`${bigGroup[0].isActive ? "grid" : "hidden"} grid-cols-2 gap-[1.042vw]`}>
                    {Object.keys(dateGroup).map((key,index)=>{
                        const typekey = key as keyof (typeof dateGroup);
                        const groupType = dateGroup[typekey];
                        return (<li key={index} className="w-[11.25vw] rounded-[2.083vw] bg-[rgba(255,255,255,.8)]">
                            <h5 className="block px-[1.042vw] pt-[0.833vw] text-[#3F3F3F] text-[2.083vw] text-right box-border">{groupType?.koreaName}</h5>
                            {/* 수입 지출 wrap */}
                            <ul className="pt-[1.25vw] pb-[1.25vw] grid gap-[1.042vw] grid-cols-2 px-[1.25vw] box-border">
                                {groupType ? Object.keys(groupType.moneyType).map((depthKey, index)=>{
                                    const moneyKey = depthKey as keyof (typeof groupType.moneyType);

                                    return(<li key={index}>
                                        {/* 카테고리 */}
                                        <div className="h-[10px] flex gap-[5px]">
                                            {groupType.moneyType[moneyKey].category !== null ? groupType.moneyType[moneyKey].category?.map((element, subIndex)=>{
                                                //element.id === category.id 일 경우 color 가져오기
                                                const findColor = category.find((item)=>item.id === element.id);
                                                return (<span key={subIndex} className="block w-[10px] h-[100%] rounded-full bg-[#000]" style={{backgroundColor:findColor !== undefined ? findColor.color : undefined}}>
                                                </span>)
                                            }) : null}
                                        </div>
                                        {/* 금액 */}
                                        <p className={`${activePalette[moneyKey].text} text-[1.042vw] text-right`}>
                                            {/* TODO:: 저번달 확인 필요, 월간/지난달 0 일 때 표기 확인 */}
                                            {Array.isArray(groupType.moneyType[moneyKey].money) && groupType.moneyType[moneyKey].money !== null ?
                                                groupType.moneyType[moneyKey].money.reduce((accumulator, currentValue) => accumulator + currentValue, 0,) :
                                                !Array.isArray(groupType.moneyType[moneyKey].money) ?
                                                    groupType.moneyType[moneyKey].money : ""}원</p>
                                    </li>)
                                }) : null}
                            </ul>
                        </li>)
                    })}
                </ul>
                {/* 카테고리순 */}
                <ul className={`${bigGroup[1].isActive ? "grid" : "hidden"} grid-cols-2 gap-[1.042vw]`}>
                    <li className="w-[11.25vw] rounded-[2.083vw] bg-[rgba(255,255,255,.8)]"></li>
                    <li></li>
                    <li></li>
                    <li></li>
                </ul>
            </div>
        </div>
    )
}