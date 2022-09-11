import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';

const HistoryZone = (props) => {
  return (
    <HistoryOutside>
      {props.trainingData.map((item, index) => (
        <HistoryItemsOutside
          index={index}
          key={uuidv4()}
          onClick={() => {
            props.openHistory(index);
          }}
        >
          <HistoryLeft>
            <HistoryPic></HistoryPic>
          </HistoryLeft>
          <HistoryRight>
            <HistoryTitle>主題：{item.title}</HistoryTitle>
            <HistoryDate>訓練日期：{item.trainingDate}</HistoryDate>
            <HistoryWeight>總重量：{item.totalWeight} KG</HistoryWeight>
            <HistoryTimes>總動作數：{item.totalActions} 個</HistoryTimes>
            <HistoryComplete>狀態：{item.complete}</HistoryComplete>
          </HistoryRight>
        </HistoryItemsOutside>
      ))}
    </HistoryOutside>
  );
};

export default HistoryZone;

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
