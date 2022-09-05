import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';

//firebase
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  Timestamp,
  orderBy,
  updateDoc,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { v4 } from 'uuid';

//chart.js
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

//components
import UserContext from '../../contexts/UserContext';
import BackActions from './BackActions';
import ArmActions from './ArmActions';
import ShoulderActions from './ShoulderActions';
import ChestActions from './ChestActions';
import CoreActions from './CoreActions';
import UpperBodyActions from './UpperBodyActions';
import AllActions from './AllActions';
import ButtLegActions from './ButtLegActions';

const Training = () => {
  //UserContext拿資料
  const { isLoggedIn, setIsLoggedIn } = useContext(UserContext);

  //抓到每筆菜單
  const [trainingData, setTrainingData] = useState();

  //建立菜單上下頁開關
  const [openTrainingInput, setOpenTrainingInput] = useState(false);
  const [openTrainingOne, setOpenTrainingOne] = useState(false);
  const [openTrainingTwo, setOpenTrainingTwo] = useState(false);
  const [openCompleteSetting, setOpenCompleteSetting] = useState(false);

  //抓出localstorage資料
  const uid = localStorage.getItem('uid');

  //抓到菜單input
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [part, setPart] = useState('');
  const [promoteActions, setPromoteActions] = useState([]);
  const [choiceAction, setChoiceAction] = useState([]);

  //計算總重量
  const [totalWeight, setTotalWeight] = useState(0);

  //身體部位佔比
  const [shoulderPercent, setShoulderPercent] = useState(0);
  const [armPercent, setArmPercent] = useState(0);
  const [chestPercent, setChestPercent] = useState(0);
  const [backPercent, setBackPercent] = useState(0);
  const [buttLegPercent, setButtLegPercent] = useState(0);
  const [corePercent, setCorePercent] = useState(0);

  //點擊哪個菜單就顯示哪個菜單
  const [showHistory, setShowHistory] = useState([]);
  const [showHistoryToggle, setShowHistoryToggle] = useState(false);
  const [showHistoryActions, setShowHistoryActions] = useState([]);

  //上傳照片
  const [imageUpload, setImageUpload] = useState(null);
  const [imageList, setImageList] = useState('');
  const [pickHistory, setPickHistory] = useState();
  const [showPicture, setShowPicture] = useState(true);

  //點擊顯示影片
  const [videoUrl, setVideoUrl] = useState('');
  const [videoShow, setVideoShow] = useState(false);

  // ＝＝＝＝＝＝＝＝＝＝＝啟動firebase＝＝＝＝＝＝＝＝＝＝＝

  const firebaseConfig = {
    apiKey: 'AIzaSyDtlWrSX2x1e0oTxI1_MN52sQsVyEwaOzA',
    authDomain: 'fitness2-d4aaf.firebaseapp.com',
    projectId: 'fitness2-d4aaf',
    storageBucket: 'fitness2-d4aaf.appspot.com',
    messagingSenderId: '440863323792',
    appId: '1:440863323792:web:3f097801137f4002c7ca15',
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const storage = getStorage(app);

  // ＝＝＝＝＝＝＝＝＝＝＝啟動firebase＝＝＝＝＝＝＝＝＝＝＝

  // ＝＝＝＝＝＝＝＝＝＝＝chart.js＝＝＝＝＝＝＝＝＝＝＝

  ChartJS.register(ArcElement, Tooltip, Legend);

  const data = {
    datasets: [
      {
        label: '# of Votes',
        data: [shoulderPercent, armPercent, chestPercent, backPercent, buttLegPercent, corePercent],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
    labels: ['肩', '手臂', '胸', '背', '臀腿', '核心'],
  };

  const dataNull = {
    datasets: [
      {
        label: '# of Votes',
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
    labels: ['肩', '手臂', '胸', '背', '臀腿', '核心'],
  };

  useEffect(() => {
    const shoulderNumber = choiceAction.filter((item) => item.bodyPart == '肩').length;
    const armNumber = choiceAction.filter((item) => item.bodyPart == '手臂').length;
    const chestNumber = choiceAction.filter((item) => item.bodyPart == '胸').length;
    const backNumber = choiceAction.filter((item) => item.bodyPart == '背').length;
    const buttLegNumber = choiceAction.filter((item) => item.bodyPart == '臀腿').length;
    const coreNumber = choiceAction.filter((item) => item.bodyPart == '核心').length;
    setShoulderPercent(shoulderNumber / choiceAction.length);
    setArmPercent(armNumber / choiceAction.length);
    setChestPercent(chestNumber / choiceAction.length);
    setBackPercent(backNumber / choiceAction.length);
    setButtLegPercent(buttLegNumber / choiceAction.length);
    setCorePercent(coreNumber / choiceAction.length);
  });

  // ＝＝＝＝＝＝＝＝＝＝＝chart.js＝＝＝＝＝＝＝＝＝＝＝

  // ＝＝＝＝＝＝＝＝＝＝點擊建立菜單+上下頁切換＝＝＝＝＝＝＝＝＝＝＝

  function addTraining() {
    setOpenTrainingInput(true);
    if (openTrainingOne !== true && openTrainingTwo !== true && openCompleteSetting !== true) setOpenTrainingOne(true);
  }

  function getPageOne() {
    setOpenTrainingOne(true);
    setOpenTrainingTwo(false);
  }

  function getPageTwo() {
    setOpenTrainingOne(false);
    setOpenTrainingTwo(true);
  }

  function getCompleteSetting() {
    if (title !== '' && date !== '') {
      setOpenTrainingOne(false);
      setOpenTrainingTwo(false);
      setOpenTrainingInput(false);
    }
  }

  function closeAddTraining() {
    setOpenTrainingInput(false);
    setOpenTrainingOne(false);
    setOpenTrainingTwo(false);
    setOpenCompleteSetting(false);
  }

  function completeTraining() {
    setShowHistoryToggle(false);
  }

  // ＝＝＝＝＝＝＝＝＝＝點擊建立菜單+上下頁切換＝＝＝＝＝＝＝＝＝＝＝

  useEffect(() => {
    if (part == '背') {
      setPromoteActions(BackActions);
    } else if (part == '手臂') {
      setPromoteActions(ArmActions);
    } else if (part == '胸') {
      setPromoteActions(ChestActions);
    } else if (part == '臀腿') {
      setPromoteActions(ButtLegActions);
    } else if (part == '核心') {
      setPromoteActions(CoreActions);
    } else if (part == '肩') {
      setPromoteActions(ShoulderActions);
    } else if (part == '上半身') {
      setPromoteActions(UpperBodyActions);
    } else if (part == '全身') {
      setPromoteActions(AllActions);
    }
  }, [part]);

  //從右邊加入左邊
  function addActionItem(e) {
    const newArray = [...choiceAction];
    newArray.push(promoteActions[e.target.id]);
    setChoiceAction(newArray);
  }

  //左邊的可以刪除
  function deleteItem(id) {
    const newNextChoiceAction = choiceAction.filter((item, index) => {
      return index !== id;
    });
    setChoiceAction(newNextChoiceAction);
  }

  //加總每個動作的重量
  function calTotalWeight() {
    const total = choiceAction.reduce((prev, item) => prev + item.weight * item.times, 0);
    setTotalWeight(total);
  }

  // ＝＝＝＝＝＝＝＝＝＝加入動作＝＝＝＝＝＝＝＝＝＝＝

  // ＝＝＝＝＝＝＝＝＝＝寫入菜單＝＝＝＝＝＝＝＝＝＝＝

  async function compeleteTrainingSetting() {
    try {
      if (title !== '' && date !== '') {
        const docRef = doc(collection(db, 'users', uid, 'trainingTables'));
        const data = {
          docID: docRef.id,
          complete: '未完成',
          picture: imageList,
          title: title,
          totalActions: choiceAction.length,
          totalWeight: totalWeight,
          trainingDate: date,
          setDate: new Date(),
          actions: choiceAction,
        };
        await setDoc(docRef, data);
      } else {
        alert('請填寫完整資料');
      }
    } catch (e) {
      console.log(e);
    }
  }

  // ＝＝＝＝＝＝＝＝＝＝寫入菜單＝＝＝＝＝＝＝＝＝＝＝

  // ＝＝＝＝＝＝＝＝＝＝即時抓出每筆菜單資料＝＝＝＝＝＝＝＝＝＝＝

  useEffect(() => {
    async function getTrainingTables() {
      const q = query(collection(db, 'users', uid, 'trainingTables'), orderBy('trainingDate'));
      onSnapshot(q, (item) => {
        const newData = [];
        item.forEach((doc) => {
          newData.push(doc.data());
          setTrainingData(newData);
        });
      });
    }
    getTrainingTables();
  }, [isLoggedIn, uid]);

  // ＝＝＝＝＝＝＝＝＝＝即時抓出每筆菜單資料＝＝＝＝＝＝＝＝＝＝＝

  // ＝＝＝＝＝＝＝＝＝＝點擊個別菜單打開內容＝＝＝＝＝＝＝＝＝＝＝

  function openHistory(index) {
    setShowHistory(trainingData[index]);
    setShowHistoryActions(trainingData[index].actions);
    setShowHistoryToggle(true);
    setPickHistory(trainingData[index].docID);
    setImageList(trainingData.picture);
    setShowPicture((prevShowPicture) => !prevShowPicture);
  }

  // ＝＝＝＝＝＝＝＝＝＝點擊個別菜單打開內容＝＝＝＝＝＝＝＝＝＝＝

  // ＝＝＝＝＝＝＝＝＝＝播放個別影片＝＝＝＝＝＝＝＝＝＝＝

  function openVideo(e) {
    setVideoUrl(promoteActions[e.target.id].videoURL);
    setVideoShow(true);
  }

  function closeVideo() {
    setVideoShow(false);
  }

  // ＝＝＝＝＝＝＝＝＝＝播放個別影片＝＝＝＝＝＝＝＝＝＝＝

  // ＝＝＝＝＝＝＝＝＝＝上傳照片、顯示照片、個別對應＝＝＝＝＝＝＝＝＝＝＝

  //上傳後即時顯示
  function uploadImage(e) {
    if (imageUpload == null) return;
    const imageRef = ref(storage, `${uid}/${pickHistory}`);
    uploadBytes(imageRef, imageUpload).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        setImageList(url);
      });
    });
    updatePicture();
  }

  //把圖片url寫到firestore的picture欄位
  function updatePicture() {
    const docRef = doc(db, 'users', uid, 'trainingTables', pickHistory);
    const data = {
      picture: imageList,
    };
    updateDoc(docRef, data);
  }

  //點到哪個菜單就顯示誰的照片
  useEffect(() => {
    const imageListRef = ref(storage, `${uid}/${pickHistory}`);
    getDownloadURL(imageListRef).then((url) => {
      setImageList(url);
    });
  }, [showPicture]);

  function closeHistory() {
    setShowHistoryToggle(false);
  }

  // ＝＝＝＝＝＝＝＝＝＝上傳照片、顯示照片、個別對應＝＝＝＝＝＝＝＝＝＝

  if (!trainingData) {
    return null;
  }

  return (
    <Wrapper>
      <LoginUser>{localStorage.getItem('name')}你好！</LoginUser>
      <AddTrainingTable onClick={addTraining}>點擊建立菜單</AddTrainingTable>
      <HistoryOutside>
        {trainingData.map((item, index) => (
          <HistoryItemsOutside
            index={index}
            onClick={() => {
              openHistory(index);
            }}
          >
            <HistoryLeft>
              <HistoryPic></HistoryPic>
            </HistoryLeft>
            <HistoryRight>
              <HistoryTitle>主題：{item.title}</HistoryTitle>
              <HistoryDate>訓練日期：{item.trainingDate}</HistoryDate>
              <HistoryWeight>總重量：{item.totalWeight}</HistoryWeight>
              <HistoryTimes>總動作數：{item.totalActions}</HistoryTimes>
              <HistoryComplete>狀態：{item.complete}</HistoryComplete>
            </HistoryRight>
          </HistoryItemsOutside>
        ))}
      </HistoryOutside>
      <OpenHistory $isHide={showHistoryToggle}>
        <Close onClick={closeHistory}>X</Close>
        <HistoryTop>
          <div>主題：{showHistory.title}</div>
          <div>訓練日期：{showHistory.trainingDate}</div>
          <div>總重量：{showHistory.totalWeight}</div>
          <div>總動作數：{showHistory.totalActions}</div>
          <div>狀態：{showHistory.complete}</div>
        </HistoryTop>
        {showHistoryActions.map((item) => {
          return (
            <HistoryActions>
              <div>部位：{item.bodyPart}</div>
              <div>動作：{item.actionName}</div>
              <div>重量：{item.weight}</div>
              <div>次數：{item.times}</div>
            </HistoryActions>
          );
        })}
        {imageList ? <HistoryImage src={imageList} /> : <HistoryImageAlert>趕快上傳照片吧</HistoryImageAlert>}
        <AddPhoto>
          <input
            type="file"
            onChange={(event) => {
              setImageUpload(event.target.files[0]);
            }}
          />
          <button
            onClick={(e) => {
              uploadImage(e);
            }}
          >
            上傳照片
          </button>
        </AddPhoto>
        <CompleteTraining onClick={completeTraining}>完成本次鍛鍊</CompleteTraining>
      </OpenHistory>
      <TrainingOutside $isHide={openTrainingInput}>
        <TrainingInputOutside>
          <TrainingOutsideOne $isHide={openTrainingOne}>
            <Close onClick={closeAddTraining}>X</Close>
            主題
            <TitleInput onChange={(e) => setTitle(e.target.value)}></TitleInput>
            日期
            <DateInput type="date" onChange={(e) => setDate(e.target.value)}></DateInput>
            <TurnOutside>
              <TurnRight onClick={getPageTwo}>下一頁</TurnRight>
            </TurnOutside>
          </TrainingOutsideOne>
          <TrainingOutsideTwo $isHide={openTrainingTwo}>
            <Close onClick={closeAddTraining}>X</Close>
            <ActionOutside>
              <ChoiceActionOutside>
                {choiceAction.map((item, index) => (
                  <ChoiceItemOutside id={index}>
                    <ChoiceItemPart>{item.bodyPart}</ChoiceItemPart>
                    <ChoiceItemName>{item.actionName}</ChoiceItemName>
                    <WeightOutside>
                      <Weight
                        onChange={(e) => {
                          choiceAction[index].weight = e.target.value;
                        }}
                      />
                      KG
                    </WeightOutside>
                    <TimesOutside>
                      <Times
                        onChange={(e) => {
                          choiceAction[index].times = e.target.value;
                        }}
                      />
                      次
                    </TimesOutside>
                    <Delete
                      onClick={() => {
                        deleteItem(index);
                      }}
                    >
                      刪除
                    </Delete>
                  </ChoiceItemOutside>
                ))}
                <TotalZone>
                  <TotalWeightButton onClick={calTotalWeight}>計算總重量</TotalWeightButton>
                  <TotalWeight>總重量：{totalWeight}</TotalWeight>
                  <TotalActionNumbers>總動作數：{choiceAction.length}</TotalActionNumbers>
                </TotalZone>
              </ChoiceActionOutside>
              <PromoteActionOutside>
                <PromoteItemOutside>
                  <PartTitle>部位</PartTitle>
                  <select onChange={(e) => setPart(e.target.value)}>
                    {/* <option value="none" selected disabled hidden>
                      請選擇選項
                    </option> */}
                    <option value="肩">肩</option>
                    <option value="手臂">手臂</option>
                    <option value="胸">胸</option>
                    <option value="背">背</option>
                    <option value="臀腿">臀腿</option>
                    <option value="核心">核心</option>
                    <option value="上半身">上半身</option>
                    <option value="全身">全身</option>
                  </select>
                  <div>
                    {promoteActions.map((item, index) => (
                      <PromoteListOutside>
                        <AddIcon
                          id={index}
                          onClick={(e) => {
                            addActionItem(e);
                          }}
                        >
                          ⊕
                        </AddIcon>
                        <PromoteListPart>{item.bodyPart}</PromoteListPart>
                        <PromoteLisName>{item.actionName}</PromoteLisName>
                        <VideoTag
                          id={index}
                          onClick={(e) => {
                            openVideo(e);
                          }}
                        >
                          影片按鈕
                        </VideoTag>
                      </PromoteListOutside>
                    ))}
                  </div>
                </PromoteItemOutside>
              </PromoteActionOutside>
            </ActionOutside>
            <CalculationShow>
              <PieOutside>{choiceAction.length > 0 ? <Pie data={data} /> : <Pie data={dataNull} />}</PieOutside>
              <CompeleteTrainingSetting
                onClick={() => {
                  getCompleteSetting();
                  compeleteTrainingSetting();
                }}
              >
                完成菜單設定
              </CompeleteTrainingSetting>
            </CalculationShow>
            <TurnOutside>
              <TurnLeft onClick={getPageOne}>上一頁</TurnLeft>
            </TurnOutside>
          </TrainingOutsideTwo>
        </TrainingInputOutside>
      </TrainingOutside>
      <Video $isHide={videoShow}>
        <Close onClick={closeVideo}>X</Close>
        <video autoPlay loop width={640} controls src={videoUrl}></video>
      </Video>
    </Wrapper>
  );
};

export default Training;

// ＝＝＝＝＝＝＝＝＝＝＝styled＝＝＝＝＝＝＝＝＝＝＝

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  width: 1000px;
  margin-top: 30px;
  font-size: 20px;
`;

const LoginUser = styled.div``;

const HistoryOutside = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
`;

const HistoryItemsOutside = styled.div`
  margin: 30px;
  cursor: pointer;
  background: #fdf5e6;
  padding: 10px;
  font-size: 16px;
`;

const HistoryLeft = styled.div``;
const HistoryRight = styled.div``;
const HistoryPic = styled.div``;
const HistoryTitle = styled.div``;
const HistoryDate = styled.div``;
const HistoryWeight = styled.div``;
const HistoryTimes = styled.div``;
const HistoryComplete = styled.div``;

const AddTrainingTable = styled.button``;

const TrainingOutside = styled.div`
  display: ${(props) => (props.$isHide ? 'block;' : 'none;')};
`;

const TrainingInputOutside = styled.div`
  background: #fff5ee;
  width: 1000px;
  height: auto;
  margin: 0 auto;
`;

const TrainingOutsideOne = styled.div`
  display: ${(props) => (props.$isHide ? 'block;' : 'none;')};
`;

const Video = styled.div`
  display: ${(props) => (props.$isHide ? 'block;' : 'none;')};
  position: fixed;
  background: #ffe4b5;
  padding: 30px;
  border-radius: 3%;
`;

const TrainingOutsideTwo = styled.div`
  display: ${(props) => (props.$isHide ? 'block;' : 'none;')};
`;

const ActionOutside = styled.div`
  display: flex;
`;

const ChoiceActionOutside = styled.div`
  background: #dcdcdc;
  width: 50%;
  padding: 10px;
`;

const ChoiceItemOutside = styled.div`
  display: flex;
  justify-content: space-evenly;
  margin: 10px;
  background: #8dc3c9;
`;

const ChoiceItemPart = styled.div`
  width: 10%;
`;

const ChoiceItemName = styled.div`
  width: 30%;
`;

const WeightOutside = styled.div`
  width: 20%;
`;

const Weight = styled.input`
  width: 30px;
`;

const TimesOutside = styled.div`
  width: 20%;
`;

const Times = styled.input`
  width: 30px;
`;

const Delete = styled.div`
  width: 20%;
  cursor: pointer;
`;

const ChoiceItem = styled.div``;

const PromoteActionOutside = styled.div`
  background: #dcdcdc;
  width: 50%;
`;

const PromoteItemOutside = styled.div`
  padding: 10px;
`;

const PartTitle = styled.div``;

const ActionTitle = styled.div``;

const PromoteListOutside = styled.div`
  display: flex;
  justify-content: space-around;
  margin: 10px;
  background: #8dc3c9;
`;

const AddIcon = styled.div`
  width: 10%;
  cursor: pointer;
`;

const PromoteListPart = styled.div`
  width: 30%;
`;

const PromoteLisName = styled.div`
  width: 30%;
`;

const VideoTag = styled.div`
  width: 30%;
  cursor: pointer;
`;

const TrainingOutsideThree = styled.div`
  display: ${(props) => (props.$isHide ? 'block;' : 'none;')};
`;

const TitleInput = styled.input``;

const DateInput = styled.input``;

const AddPhoto = styled.button``;

const CompleteTraining = styled.button``;

const PieOutside = styled.div`
  max-width: 350px;
  padding: 10px;
  margin: 0 auto;
`;

const CalculationShow = styled.div`
  margin: 0 auto;
`;

const Calculation = styled.div``;

const TotalWeight = styled.div``;

const TotalActionNumbers = styled.div``;

const TrainingOutsideThreeLeft = styled.div`
  display: flex;
`;

const TotalZone = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 10px 10px;
`;

const TotalWeightButton = styled.button``;

const CompeleteTrainingSetting = styled.button``;

const TrainingSettingComplete = styled.div`
  display: ${(props) => (props.$isHide ? 'block;' : 'none;')};
`;

const TurnLeft = styled.div``;

const TurnRight = styled.div``;

const TurnOutside = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Close = styled.div``;

const OpenHistory = styled.div`
  display: ${(props) => (props.$isHide ? 'block;' : 'none;')};
  margin: 0 auto;
  background: #dcdcdc;
  margin-bottom: 20px;
  width: 800px;
  padding: 10px;
`;

const HistoryActions = styled.div`
  display: flex;
  justify-content: space-between;
`;

const HistoryTop = styled.div`
  display: flex;
  justify-content: space-between;
`;

const HistoryImage = styled.img`
  width: 200px;
  height: auto;
`;

const HistoryImageAlert = styled.div``;

// ＝＝＝＝＝＝＝＝＝＝＝styled＝＝＝＝＝＝＝＝＝＝＝
