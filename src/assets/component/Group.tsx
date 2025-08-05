import {useCategoryGroupStore, useDateGroupStore} from "../store/Group.ts";
import {useActivePaletteStore, useCategoryStore, useMobileTabStore} from "../store/All.ts";
import {useState} from "react";

interface BigGroup {
    koreaName: string;
    isActive: boolean;
}
export default function Group(){
    //ALL.tsx
    const mobileTabView = useMobileTabStore((state) => state.tab);
    const activePalette = useActivePaletteStore((state) => state.palette);
    const category = useCategoryStore((state) => state.list);

    //Group.tsx
    const dateGroup = useDateGroupStore((state) => state.total);
    const categoryGroup = useCategoryGroupStore((state) => state.total);

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
    //모바일 isView 관련
    const findView = mobileTabView.find((element)=>element.isView);

    return (
        <div className={`${findView?.id === 1 ? "block" : "hidden"} mr-[5.333vw] sm:mr-[2.604vw] md:block md:mr-[1.042vw]`}>
            {/* 탭 */}
            <ul className="flex gap-[2.667vw] sm:gap-[1.302vw] md:gap-[0.521vw]">
                {bigGroup.map((element, index) => {
                    return (<li key={index} className={`
                        px-[5.333vw] py-[3.2vw] rounded-[10.667vw] shadow-lg text-[4.267vw] ${element.isActive ? "text-[#fff] bg-[#FF5858]" : "text-[#000] bg-[#fff]"}
                        sm:px-[2.604vw] sm:py-[1.563vw] sm:rounded-[5.208vw] sm:text-[2.083vw]
                        md:px-[1.042vw] md:py-[0.625vw] md:rounded-[2.083vw] md:text-[0.833vw]
                    `}>
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
            <div className="pt-[6.4vw] sm:pt-[3.125vw] md:pt-[1.25vw]">
                {/* 날짜순 */}
                <ul className={`${bigGroup[0].isActive ? "grid" : "hidden"} grid-cols-2 gap-[5.333vw] sm:gap-[2.604vw] md:gap-[1.042vw]`}>
                    {Object.keys(dateGroup).map((key,index)=>{
                        const typekey = key as keyof (typeof dateGroup);
                        const groupType = dateGroup[typekey];
                        return (<li key={index} className="
                            w-[12.5vw] rounded-[10.667vw] bg-[rgba(255,255,255,.8)]
                            sm:w-[12.5vw] sm:rounded-[5.208vw]
                            md:w-[12.5vw] md:rounded-[2.083vw]
                        ">
                            <h5 className="
                                block px-[5.333vw] pt-[4.267vw] text-[#3F3F3F] text-[10.667vw] text-right box-border
                                sm:px-[2.604vw] sm:pt-[2.083vw] sm:text-[5.208vw]
                                md:px-[1.042vw] md:pt-[0.833vw] md:text-[2.083vw]
                            ">{groupType?.koreaName}</h5>
                            {/* 수입 지출 wrap */}
                            <ul className="
                                pt-[6.4vw] pb-[6.4vw] grid gap-[0.833vw] grid-cols-2 px-[6.4vw] box-border
                                sm:pt-[3.125vw] sm:pb-[3.125vw] sm:gap-[0.833vw] sm:px-[3.125vw]
                                md:pt-[1.25vw] md:pb-[1.25vw] md:gap-[0.833vw] md:px-[1.25vw]
                            ">
                                {groupType ? Object.keys(groupType.moneyType).map((depthKey, subIndex)=>{
                                    const moneyKey = depthKey as keyof (typeof groupType.moneyType);

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



                                            //.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
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

                                    const allSum = Array.isArray(groupType.moneyType[moneyKey].money) && (typekey === "thisMonth" || typekey === "lastMonth") ?
                                        processedArr.reduce((accumulator, currentValue) => accumulator + currentValue, 0) :
                                        !Array.isArray(groupType.moneyType[moneyKey].money) && groupType.moneyType[moneyKey].money !== null ?
                                            groupType.moneyType[moneyKey].money : 0;

                                    return(<li key={subIndex}>
                                        {/* 카테고리 */}
                                        <div className="
                                            h-[2.667vw] flex gap-[1.333vw]
                                            sm:h-[1.302vw] sm:gap-[0.651vw]
                                            md:h-[0.521vw] md:gap-[0.26vw]
                                        ">
                                            {groupType.moneyType[moneyKey].category !== null ? groupType.moneyType[moneyKey].category?.map((element, inIndex)=>{
                                                //element.id === category.id 일 경우 color 가져오기
                                                const findColor = category.find((item)=>item.id === element.id);
                                                return (<span key={inIndex} className="block w-[2.667vw] h-[100%] rounded-full bg-[#000] sm:w-[1.302vw] md:w-[0.521vw]" style={{backgroundColor:findColor !== undefined ? findColor.color : undefined}}>
                                                </span>)
                                            }) : null}
                                        </div>
                                        {/* 금액 */}
                                        <p className={`${activePalette[moneyKey].text} text-right`}>
                                            <span className="
                                                w-[17.333vw] inline-block align-bottom group overflow-hidden text-[5.333vw]
                                                sm:w-[8.464vw] sm:text-[2.604vw]
                                                md:w-[3.385vw] md:text-[1.042vw]
                                            ">
                                                <span className="inline-block duration-1000 group-hover:translate-x-[-50%]">
                                                    {/* TODO:: 저번달 확인 필요, */}
                                                    {allSum?.toLocaleString()}
                                                </span>
                                            </span>
                                            <span className="
                                                inline-block ml-[1.333vw] text-[3.733vw] align-bottom
                                                sm:ml-[0.651vw] sm:text-[1.823vw]
                                                md:ml-[0.26vw] md:text-[0.729vw]
                                            ">원</span>
                                        </p>

                                    </li>)
                                }) : null}
                            </ul>
                        </li>)
                    })}
                </ul>
                {/* 카테고리순 */}
                <ul className={`${bigGroup[1].isActive ? "grid" : "hidden"} grid-cols-2 gap-[1.042vw]`}>
                    {categoryGroup.map((key, index)=>{

                        return (<li key={index} className="w-[12.5vw] rounded-[10.667vw] bg-[rgba(255,255,255,.8)]
                            sm:w-[12.5vw] sm:rounded-[5.208vw]
                            md:w-[12.5vw] md:rounded-[2.083vw]" style={{backgroundImage:`linear-gradient(180deg, ${key.color}, transparent)`}}>
                            <h5 className="
                                block mx-[5.333vw] pt-[4.267vw] text-[#3F3F3F] text-[6.4vw] text-right box-border overflow-hidden
                                sm:mx-[2.604vw] sm:pt-[2.083vw] sm:text-[3.125vw]
                                md:mx-[1.042vw] md:pt-[0.833vw] md:text-[1.25vw]
                            "><span className="whitespace-pre" style={{color:key.color === "#030417" ? "white" : "inherit"}}>{key.koreaName}</span></h5>
                            {/* 수입 지출 wrap */}
                            <ul className="
                                pt-[6.4vw] pb-[6.4vw] grid gap-[0.833vw] grid-cols-2 px-[6.4vw] box-border
                                sm:pt-[3.125vw] sm:pb-[3.125vw] sm:gap-[0.833vw] sm:px-[3.125vw]
                                md:pt-[1.25vw] md:pb-[1.25vw] md:gap-[0.833vw] md:px-[1.25vw]
                            ">
                                <li>
                                    {/* 수입 금액 */}
                                    <p className={`${activePalette.income.text} text-right`}>
                                        <span className="
                                            w-[17.333vw] inline-block align-bottom group overflow-hidden text-[5.333vw]
                                            sm:w-[8.464vw] sm:text-[2.604vw]
                                            md:w-[3.385vw] md:text-[1.042vw]
                                        ">
                                            <span className="inline-block duration-1000 group-hover:translate-x-[-50%]">{key.incomeMoney}</span>
                                        </span>
                                        <span className="
                                            inline-block ml-[1.333vw] text-[3.733vw] align-bottom
                                            sm:ml-[0.651vw] sm:text-[1.823vw]
                                            md:ml-[0.26vw] md:text-[0.729vw]
                                        ">원</span>
                                    </p>
                                </li>
                                <li>
                                    {/* 지출 금액 */}
                                    <p className={`${activePalette.export.text} text-right`}>
                                        <span className="
                                            w-[17.333vw] inline-block align-bottom group overflow-hidden text-[5.333vw]
                                            sm:w-[8.464vw] sm:text-[2.604vw]
                                            md:w-[3.385vw] md:text-[1.042vw]
                                        ">
                                            <span className="inline-block duration-1000 group-hover:translate-x-[-50%]">{key.exportMoney}</span>
                                        </span>
                                        <span className="
                                            inline-block ml-[1.333vw] text-[3.733vw] align-bottom
                                            sm:ml-[0.651vw] sm:text-[1.823vw]
                                            md:ml-[0.26vw] md:text-[0.729vw]
                                        ">원</span>
                                    </p>
                                </li>
                            </ul>
                        </li>)
                    })}
                    <li></li>
                    <li></li>
                    <li></li>
                </ul>
            </div>
        </div>
    )
}