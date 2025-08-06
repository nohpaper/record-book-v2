import {useEffect, useState} from "react";
import moment from 'moment';
import { useDateListStore } from "../store/List.tsx";
import {useActivePaletteStore, useCategoryStore, useMobileTabStore} from "../store/All.ts";
import {useCategoryGroupStore, useDateGroupStore} from "../store/Group.ts";

// 5px ->  1.333vw / sm:0.651vw / md:0.26vw
// 10px -> 2.667vw / sm:1.302vw / md:0.521vw
// 12px -> 3.2vw / sm:1.563vw / md:0.625vw
// 14px -> 3.733vw / sm:1.823vw / md:0.729vw
// 16px -> 4.267vw / sm:2.083vw / md:0.833vw
// 20px -> 5.333vw / sm:2.604vw / md:1.042vw
// 24px -> 6.4vw / sm:3.125vw / md:1.25vw
// 34px -> 9.067vw / sm:4.427vw / md:1.771vw
// 40px -> 10.667vw / sm:5.208vw / md:2.083vw
// 64px -> 17.067vw / sm:8.333vw / md:3.333vw
// 70px -> 18.667vw / sm:9.115vw / md:3.646vw
// 90px -> 24vw / sm:11.719vw / md:4.688vw

// TODO :: list에 카테고리 반영 및 zustand에 전송!

//색상 변경 관련 배열
interface ChangeInput {
    money:string | null,
    memo:string,
}
export interface SaveField {
    id:number,
    typeButton: {
        income: {
            isActive: boolean,
        },
        export: {
            isActive: boolean,
        }
    },
    money:string | null,
    category: {
        id:number | null,
        color:string,
        name:string,
    },
    memo:string,
}
const todayTime = moment().format("YYYY-MM-DD");

//카테고리 이름 변경 관련 Group.ts 에 데이터 전송 타입
export interface PushData {
    id:number;
    koreaName:string;
}

export default function List(){
    //ALL.tsx
    const mobileTabView = useMobileTabStore((state) => state.tab);
    const activePalette = useActivePaletteStore((state) => state.palette);
    const category = useCategoryStore((state) => state.list);
    const categoryActiveChange = useCategoryStore((state) => state.activeChange);
    const categoryNameChange = useCategoryStore((state) => state.nameChange);

    //List.tsx
    const todayList = useDateListStore((state) => state.today);
    const listArrangement = useDateListStore((state) => state.listArrangement);
    const deleteItem = useDateListStore((state) => state.deleteItem); //삭제 관련 store

    //group.tsx
    const initUpdate = useDateGroupStore((state) => state.initUpdate);
    const dateMathSum = useDateGroupStore((state) => state.mathSum);
    const dateMathImsub = useDateGroupStore((state) => state.mathImsub);
    const updateInfo = useCategoryGroupStore((state) => state.updateInfo);
    const categoryMathSum = useCategoryGroupStore((state) => state.mathSum);
    const categoryMathImsub = useCategoryGroupStore((state) => state.mathImsub);

    //클릭하는 타입들 useState
    const [clickType, setClickType] = useState({
        typeButton:{
            income: {
                KoreaName:"수입", //string
                isActive: false, //boolean
            },
            export: {
                KoreaName:"지출", //string
                isActive: false,  //boolean
            }
        }
    });
    //changeInput useState (금액, 메모)
    const [changeInput, setChangeInput] = useState<ChangeInput>({
        money:null,
        memo:"",
    });
    const [isViewCategory, setIsViewCategory] = useState({
        first: false,
        always: false,
    });
    //입력란에 있는 내용으로 삽입 및 변경됨. +버튼을 누르면 zustand store으로 이동, 성공 후 초기화
    const [saveField, setSaveField] = useState<SaveField>({
        id:-1, //number
        typeButton: {
            income: {
                isActive: false, //boolean
            },
            export: {
                isActive: false,  //boolean
            }
        },
        money:null, //number | null
        category: {
            id:null, //number | null
            color:"", //string
            name:"", //string
        },
        memo:"", //string
    });

    //state.today 에서 오늘 날짜를 가진 객체 찾기
    const todayData = todayList.find((element)=>element.date === todayTime);
    //카테고리 선택관련 .isActive true 찾기
    const categoryIsActive = category.find((element)=>element.isActive);
    //모바일 isView 관련
    const findView = mobileTabView.find((element)=>element.isView);


    const [isSubmitButton, setIsSubmitButton] = useState(false); //form 태그 onSubmin 발동 시 애니메이션 발동

    useEffect(() => {
        initUpdate(todayTime);
    }, []);
    return (
    <div className={`${findView?.id === 0 ? "block" : "hidden"} w-[100%] md:w-[15.625vw] md:pt-[3.333vw]`}>
        {/* 입력란 */}
        <form onSubmit={(event) => {
            event.preventDefault();
            setIsSubmitButton(true);

            //id ++
            //money, memo -> changeInput 에서 값 가져오기
            //category -> category 에서 값 가져오기
            const copySaveField = {...saveField,
                typeButton: {
                ...saveField.typeButton,
                    income: {...saveField.typeButton.income},
                    export: {...saveField.typeButton.export} },
                category: {...saveField.category}
            };

            const copyChangeInput = {...changeInput};
            const checkButtonBoolean = Object.values(clickType.typeButton).map((element)=>element.isActive); //내용 삽입 전이기때문에 clickType 내용으로 판단
            //금액 단위로 볼 수 없는 경우들 체크
            const checkMoneyOnlyZero = /^0+$/.test(String(changeInput.money));
            const checkMoneyStartZero = String(changeInput.money).length > 1 && String(changeInput.money).startsWith('0');

            if(!checkButtonBoolean.includes(true) || (changeInput.money === null || changeInput.money === "")) {
                //true가 없을 경우
                alert("수입/지출 버튼과 금액을 입력해주세요");
            }else if(checkMoneyOnlyZero || checkMoneyStartZero) {
                //금액이 0, 000, 0001, 023 같이 금액 단위으로 볼 수 없을 경우
                alert("바른 금액을 입력해주세요");
                copyChangeInput.money = null; //내용 삭제
                setChangeInput(copyChangeInput);
            }else {
                /*if
                * 1. 수입 or 지출 하나의 버튼에라도 true가 있을 경우
                * 2. changeInput.money가 null이 아닌경우
                * */
                console.log(copySaveField)
                copySaveField.id += 1;
                copySaveField.typeButton.income.isActive = clickType.typeButton.income.isActive;
                copySaveField.typeButton.export.isActive = clickType.typeButton.export.isActive;
                copySaveField.category.id = categoryIsActive !== undefined && isViewCategory.first ? categoryIsActive.id : null;
                copySaveField.money = changeInput.money;
                copySaveField.memo = changeInput.memo;
                setSaveField(copySaveField);
                listArrangement(copySaveField); //List.tsx로 이동

                dateMathSum(todayTime, copySaveField);
                categoryMathSum(todayTime, copySaveField);

                /* 1.보내기 성공 후 값 초기화
                    1-1. copySaveField.typeButton
                    1-2. changeInput
                    1-3. category
                2. 값 넣기
                    2-1. copySaveField.id
            * */
                const copyClickType = {...clickType, typeButton: {...clickType.typeButton, income: {...clickType.typeButton.income}, export: {...clickType.typeButton.export}, }};

                copyClickType.typeButton.income.isActive = false;
                copyClickType.typeButton.export.isActive = false;
                setClickType(copyClickType);

                copyChangeInput.money = null;
                copyChangeInput.memo = "";
                setChangeInput(copyChangeInput);
            }
        }}>
            <div className="relative rounded-[2.083vw] bg-[rgba(255,255,255,.7)] shadow-lg">
            {/* 새 입력 버튼 */}
                <button type="submit" className={`
                w-[14.667vw] h-[14.667vw] absolute top-[-0.625vw] left-[-0.729vw] cursor-pointer rounded-full bg-[#FF5858] duration-700 origin-center
                sm:w-[7.161vw] sm:h-[7.161vw] md:w-[2.865vw] md:h-[2.865vw]
                hover:rotate-[180deg] ${isSubmitButton ? "rotate-[180deg]" : null}
                after:content-['+'] after:absolute after:top-[42%] after:left-1/2 after:text-[#ffffff] after:text-[7.516vw] after:font-light after:translate-x-[-50%] after:translate-y-[-50%]
                md:after:text-[3.333vw]
                `}></button>
                {/* 금일 일자 wrap */}
                <div className="
                    w-[100%] inline-block pt-[3.2vw] px-[6.4vw] text-right
                    sm:pt-[1.563vw] sm:px-[3.125vw]
                    md:pt-[0.625vw] md:px-[1.25vw]
                ">
                    <p className="text-[#999999] text-[14.667vw] leading-[110%] font-normal sm:text-[7.516vw] md:text-[3.333vw]">{moment().format("DD")}</p>
                </div>
                {/* 수입&지출 버튼 및 금액 wrap */}
                <div className="
                    flex justify-center pt-[6.4vw] px-[9.067vw]
                    sm:pt-[3.125vw] sm:px-[4.427vw]
                    md:pt-[1.25vw] md:px-[1.771vw]
                ">
                    {/* 수입&지출 버튼 */}
                    <ul className="flex gap-[1.333vw] mr-[0.729vw] sm:gap-[0.651vw] md:gap-[0.26vw]">
                        {Object.keys(clickType.typeButton).map((key, index)=>{
                            const typeKey = key as keyof (typeof clickType)["typeButton"];

                            return (<li key={index}><button type="button"
                                                            className={`
                                                                px-[0.729vw] py-[1.333vw] cursor-pointer text-[3.733vw] font-normal rounded-[5.333vw] duration-150 whitespace-nowrap hover:text-[#000000]
                                                                sm:py-[0.651vw] sm:text-[1.823vw] sm:rounded-[2.604vw]
                                                                md:py-[0.26vw] md:text-[0.729vw] md:rounded-[1.042vw]
                                                            ${!clickType.typeButton[typeKey].isActive ? "text-[#575757] bg-[#D4D4D4]" : activePalette[typeKey].button }`}
                                                            onClick={(event)=>{
                                                                event.preventDefault();
                                                                const copyClickType = {...clickType, typeButton: {...clickType.typeButton, income: {...clickType.typeButton.income}, export: {...clickType.typeButton.export}, }};
                                                                const typeButton = copyClickType.typeButton;

                                                                if(!typeButton[typeKey].isActive){
                                                                    //클릭한 [typeKey].isActive 값이 false 일 경우
                                                                    Object.keys(copyClickType.typeButton).map((element)=>{
                                                                        const copyTypeKey = element as keyof (typeof saveField)["typeButton"];
                                                                        return typeButton[copyTypeKey].isActive = false; //income, export의 isActive 값 false로 (다른 버튼 true일 경우를 대비하여 모두 false시킴)
                                                                    });
                                                                    typeButton[typeKey].isActive = true;//클릭한 것만 true
                                                                }else {
                                                                    typeButton[typeKey].isActive = false; //다시 클릭했을 경우 false;
                                                                }

                                                                setClickType(copyClickType);
                            }}>{clickType.typeButton[typeKey].KoreaName}</button></li>)
                        })}
                    </ul>
                    {/* 금액 */}
                    <div className="flex items-center mt-[1.333vw] sm:mt-[0.651vw] md:mt-[0.26vw]">
                        <input type="text" className={`
                            w-[4.688vw] rounded-[1.333vw] text-[1.25vw] text-right leading-[110%] ${clickType.typeButton.income.isActive ? activePalette.income.text : clickType.typeButton.export.isActive ? activePalette.export.text : "text-[#000000]" }
                            sm:w-[4.688vw] sm:rounded-[0.651vw] 
                            md:w-[4.688vw] md:rounded-[0.26vw]
                            `} value={changeInput.money === null ? "" : changeInput.money} onChange={(event) => {
                            const copyChangeInput = {...changeInput};
                            const changeText = event.target.value.replace(/[^0-9]/g, "");
                            if(event.target.value !== "-"){
                                copyChangeInput.money = changeText;
                            }

                            setChangeInput(copyChangeInput);
                        }} onBlur={()=>{
                            const copyChangeInput = {...changeInput};
                            const changeMoney = copyChangeInput.money;

                            if(changeMoney !== null){
                                copyChangeInput.money = changeMoney.replace(/\B(?=(\d{3})+(?!\d))/g, ",");//세자리마다 쉼표 삽입

                                setChangeInput(copyChangeInput);
                            }
                        }}/>
                        <p className={`text-[6.4vw] leading-[110%] sm:text-[3.125vw] md:text-[1.25vw] ${clickType.typeButton.income.isActive ? activePalette.income.text : clickType.typeButton.export.isActive ? activePalette.export.text : "text-[#000000]" }`}>원</p>
                    </div>
                </div>
                {/* 카테고리 및 메모 wrap */}
                <div className="
                    flex gap-[18.667vw] items-center justify-center relative mt-[6.4vw] ml-[9.067vw] pr-[9.067vw] pb-[6.4vw]
                    sm:gap-[9.115vw] sm:mt-[3.125vw] sm:ml-[4.427vw] sm:pr-[4.427vw] sm:pb-[3.125vw]
                    md:gap-[3.646vw] md:mt-[1.25vw] md:ml-[1.771vw] md:pr-[1.771vw] md:pb-[1.25vw]
                ">
                    <button type="button" className={`
                            w-[3.733vw] h-[3.733vw] block rounded-full cursor-pointer ${!isViewCategory.first ? "bg-conic/decreasing from-violet-700 via-lime-300 to-violet-700" : null}
                            sm:w-[1.823vw] sm:h-[1.823vw]
                            md:w-[0.729vw] md:h-[0.729vw]
                        `} style={{backgroundColor:isViewCategory.first && categoryIsActive !== undefined ? categoryIsActive.color : undefined}} onClick={()=>{
                        const copyIsViewCategory = {...isViewCategory};
                        copyIsViewCategory.first = true;
                        copyIsViewCategory.always = !copyIsViewCategory.always; //클릭할때마다 변경
                        setIsViewCategory(copyIsViewCategory);
                        if(!copyIsViewCategory.always){
                            //copyIsViewCategory.always false일 경우

                            const pushArray: PushData[] = [];

                            category.forEach((element,)=>{
                                pushArray.push({id:element.id, koreaName:element.name});
                            });

                            updateInfo(pushArray);
                            //group.ts useCategoryGroupStore 에 전송
                        }
                    }}></button>
                    <input type="text" className="
                        w-[34.667vw] rounded-[1.333vw] text-[3.733vw] text-[#000000]
                        sm:w-[16.927vw] sm:rounded-[0.651vw] sm:text-[1.823vw]
                        md:w-[6.771vw] md:rounded-[0.26vw] md:text-[0.729vw]
                        " placeholder="메모란..." value={changeInput.memo} onChange={(event) => {
                        const copyChangeInput = {...changeInput};
                        copyChangeInput.memo = event.target.value;

                        setChangeInput(copyChangeInput);
                    }}/>
                    {/* 카테고리 선택 창 */}
                    <div className={`
                        ${isViewCategory.always ? "block" : "hidden"} absolute top-[6.4vw] left-[0] rounded-[5.333vw] border border-[#E9E9E9] bg-[#ffffff] shadow-lg
                        sm:top-[3.125vw] sm:rounded-[2.604vw]
                        md:top-[1.25vw] md:rounded-[1.042vw]
                    `}>
                        {/* 카테고리 색상 선택 */}
                        <ul className="
                            flex gap-[1.333vw] px-[0.833vw] pt-[2.667vw] pb-[2.667vw]
                            sm:gap-[0.651vw] sm:px-[0.833vw] sm:pt-[1.302vw] sm:pb-[1.302vw]
                            md:gap-[0.26vw] md:px-[0.833vw] md:pt-[0.521vw] md:pb-[0.521vw]
                            ">
                            {category.map((element, index)=>{
                                return (<li key={index} className={`
                                    w-[4.267vw] h-[4.267vw] relative
                                    sm:w-[2.083vw] sm:h-[2.083vw]
                                    md:w-[0.833vw] md:h-[0.833vw]
                                `}>
                                    <button type="button" className={`${element.isActive ? "w-[4.267vw] h-[4.267vw] sm:w-[2.083vw] sm:h-[2.083vw] md:w-[0.833vw] md:h-[0.833vw]" : "w-[2.667vw] h-[2.667vw] sm:w-[1.302vw] sm:h-[1.302vw] md:w-[0.521vw] md:h-[0.521vw]"} block absolute top-1/2 left-1/2 cursor-pointer rounded-full translate-x-[-50%] translate-y-[-50%] duration-150`} style={{backgroundColor: element.color}} onClick={()=>{
                                        categoryActiveChange(index);
                                    }}></button>
                                </li>)
                            })}
                        </ul>
                        <input type="text" className="
                            w-[48vw] mx-[4.267vw] mt-[1.333vw] mb-[3.733vw] text-[#000000] text-[3.733vw]
                            sm:w-[23.438vw] sm:mx-[2.083vw] sm:mt-[0.651vw] sm:mb-[1.823vw] sm:text-[1.823vw]
                            md:w-[9.375vw] md:mx-[0.833vw] md:mt-[0.26vw] md:mb-[0.729vw] md:text-[0.729vw]
                        " value={categoryIsActive !== undefined ? categoryIsActive.name : undefined} onChange={(event) => {
                            categoryNameChange(event.target.value);
                        }}/>
                    </div>
                </div>
            </div>
        </form>
        {/* 리스트 */}
        <ul className="h-[96vw] pt-[2.667vw] overflow-y-auto sm:h-[46.875vw] sm:pt-[1.302vw] md:h-[18.75vw] md:pt-[0.521vw]">
            {todayData !== undefined ? todayData.list.map((element, index)=>{
                if(!element.isDeleted){
                    const useObject = category.find((item)=>item.id === element.categoryID);

                    return (<li key={index} className="
                        flex justify-between mt-[2.667vw] px-[6.4vw] py-[3.733vw] rounded-[10.667vw] bg-[rgba(255,255,255,.7)]
                        sm:mt-[1.302vw] sm:px-[3.125vw] sm:py-[1.823vw] sm:rounded-[5.208vw]
                        md:mt-[0.521vw] md:px-[1.25vw] md:py-[0.729vw] md:rounded-[2.083vw]
                    ">
                        {/* 카테고리, 메모 wrap */}
                        <div>
                            <p className="text-[#000000] text-[3.2vw] sm:text-[1.563vw] md:text-[0.625vw]">{element.memo}</p>
                            <div className="flex pt-[1.333vw] sm:pt-[0.651vw] md:pt-[0.26vw]">
                                <span className="
                                    w-[3.733vw] h-[3.733vw] block rounded-full
                                    sm:w-[1.25vw] sm:h-[1.25vw]
                                    md:w-[0.729vw] md:h-[0.729vw]
                                " style={{backgroundColor: useObject !== undefined ? useObject.color : undefined}}></span>
                            </div>
                        </div>
                        {/* 금액, 닫기 wrap */}
                        <div className="flex items-center">
                            <p className={`${element.activeButton.income ? activePalette.income.text : activePalette.export.text } text-[4.267vw] sm:text-[2.083vw] md:text-[0.833vw]`}>{element.money}원</p>
                            <div className="ml-[2.667vw] sm:ml-[1.302vw] md:ml-[0.521vw]">
                                <button type="button" className="
                                    w-[7.467vw] block cursor-pointer rounded-[10.667vw] text-[#8F8F8F] text-[3.733vw] duration-150 hover:text-[#000000] hover:bg-[#e5e5e5]
                                    sm:w-[3.646vw] sm:text-[1.823vw] sm:rounded-[5.208vw]
                                    md:w-[1.458vw] md:text-[0.729vw] md:rounded-[2.083vw]
                                " onClick={()=>{
                                    const deleteQuestion = confirm("정말 삭제하시겠습니까?");

                                    if(deleteQuestion){
                                        //확인 버튼을 눌렀을 경우
                                        dateMathImsub(element);
                                        categoryMathImsub(element);
                                        deleteItem(element.id);
                                    }else {
                                        //취소 버튼을 눌렀을 경우
                                    }
                                }}>X</button>
                            </div>
                        </div>
                    </li>)
                }
            }) : null}
        </ul>
    </div>)
}