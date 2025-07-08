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
                        return (<li key={index} className="w-[240px] rounded-[2.083vw] bg-[rgba(255,255,255,.8)]">
                            <h5 className="block px-[1.042vw] pt-[0.833vw] text-[#3F3F3F] text-[2.083vw] text-right box-border">{groupType?.koreaName}</h5>
                            {/* 수입 지출 wrap */}
                            <ul className="pt-[1.25vw] pb-[1.25vw] grid gap-[0.833vw] grid-cols-2 px-[1.25vw] box-border">
                                {groupType ? Object.keys(groupType.moneyType).map((depthKey, subIndex)=>{
                                    const moneyKey = depthKey as keyof (typeof groupType.moneyType);

                                    //250708 확인 필요 start
                                    //이번달, 저번달 배열 내용 string -> number 타입으로 변환
                                    let processedArr: number[] = [];
                                    if(Array.isArray(groupType.moneyType[moneyKey].money) && (typekey === "thisMonth" || typekey === "lastMonth")){
                                        //money 가 배열이고, typeKey 가 thisMonth 거나 lastMonth 일 경우
                                        processedArr = groupType.moneyType[moneyKey].money?.map(item => {
                                            if (typeof item === 'string') {
                                                // 쉼표 제거 후 숫자로 변환
                                                return Number(item.replace(/,/g, ''));
                                            }
                                            return item; // 문자열이 아니면 그대로 반환
                                        });
                                        console.log(typekey, groupType.moneyType[moneyKey].money, processedArr)
                                    }

                                    /*
                                    * type string 을 number 로 변환하여 입력
                                    * 1. 들어오는 type 은 항상 string
                                    * 2. number[] 로 변환, 콤마 제거, Number() 합
                                    *
                                    * 3. 들어오는 항목마다 string 이기 때문에 항상 2번으로 돌아가야함
                                    * 4. groupType.moneyType[moneyKey].money 사용 불가
                                    * 5. 항상 다른 배열로 ....
                                    *
                                    * 6. 합산 후 type string , 콤마 추가
                                    * */


                                    const allSum = [];
                                    /*
                                    * { groupType: "thisMonth", income:number(합산 금액), export:number(합산 금액) }
                                    * 1. allSum 내부에 groupType:thisMonth 가 없다면
                                    *   1-1.  객체 삽입 기본값 { groupType: "thisMonth", income:0, export:0 }
                                    * 2. 내부에 있다면
                                    *   2-1. 해당 객체 income or export 에 계산된 값으로 변경
                                    * 3. 내부에 있으나, date 값이 변경되었을 경우
                                    *   3-1. 내부 내용 교체 date / income & export 초기화
                                    *
                                    * */
                                    //250708 확인 필요 end

                                    return(<li key={subIndex}>
                                        {/* 카테고리 */}
                                        <div className="h-[10px] flex gap-[5px]">
                                            {groupType.moneyType[moneyKey].category !== null ? groupType.moneyType[moneyKey].category?.map((element, inIndex)=>{
                                                //element.id === category.id 일 경우 color 가져오기
                                                const findColor = category.find((item)=>item.id === element.id);
                                                return (<span key={inIndex} className="block w-[10px] h-[100%] rounded-full bg-[#000]" style={{backgroundColor:findColor !== undefined ? findColor.color : undefined}}>
                                                </span>)
                                            }) : null}
                                        </div>
                                        {/* 금액 */}
                                        <p className={`${activePalette[moneyKey].text} text-right`}>
                                            <span className="w-[65px] inline-block align-bottom group overflow-hidden text-[1.042vw]">
                                                <span className="inline-block duration-1000 group-hover:translate-x-[-50%]">
                                                    {/* TODO:: 저번달 확인 필요, */}
                                                    {Array.isArray(groupType.moneyType[moneyKey].money) && (typekey === "thisMonth" || typekey === "lastMonth") ?
                                                        processedArr.reduce((accumulator, currentValue) => accumulator + currentValue, 0) :
                                                        !Array.isArray(groupType.moneyType[moneyKey].money) ?
                                                            groupType.moneyType[moneyKey].money : 0}
                                                </span>
                                            </span>
                                            <span className="inline-block text-[14px] align-bottom ml-[5px]">원</span>
                                        </p>

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