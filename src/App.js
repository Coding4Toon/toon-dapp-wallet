import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import header from "./images/header.png";
import Nav from "./Nav.js";

const truncate = (input, len) => (input.length > len ? `${input.substring(0, len)}...` : input);

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 40px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.div`
  text-align: center;
  margin-top: 75px;
  margin-bottom: 75px;
  color: var(--secondary);
  // text-shadow: 1px 1px 2px black, 0 0 8px white, 0 0 1px white;
  font-size: 80px;
  @media (max-width: 767px) {
    font-size: 55px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;



function App() {
  const dispatch = useDispatch();
  const [owner, setOwner] = useState(null);
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [buyingTokens, setBuyingTokens] = useState(false);
  const [mintingERC20, setMintingERC20] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  console.log("[+] Supply", data.totalSupply);
  console.log("[+] Contract Owner", data.contractOwner);
  console.log("[+] Wallet connected", blockchain.account);
  console.log("[+] Sale duration", data.saleDuration);

  const mintERC20 = () => {
    console.log("[+] Start with init supply : ", data.totalSupply);
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    console.log("[+] Minting...");
    setMintingERC20(true);
    console.log("[+] True");
    blockchain.smartContract.methods
      .ownerMint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        from: blockchain.account,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setMintingERC20(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `Cool! Now the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
        );
        setMintingERC20(false);
        dispatch(fetchData(blockchain.account));
      });
    console.log("[+] Done");
  };

  const buyTokens = () => {
    console.log("[+] Start with init supply:", data.totalSupply);

    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);

    console.log("Cost:", totalCostWei);
    console.log("Gas limit:", totalGasLimit);
    setFeedback(`Buying your ${CONFIG.NFT_NAME}...`);

    console.log("[+] Buying...");
    setBuyingTokens(true);

    blockchain.smartContract.methods
      .buyTokens(mintAmount)
      .send({
        gasLimit: totalGasLimit,
        from: blockchain.account,
        value: totalCostWei,
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(`Cool! Now the ${CONFIG.NFT_NAME} is yours! Go visit your wallet to view it.`);
        setBuyingTokens(false);
        dispatch(fetchData(blockchain.account));
      })
      .catch((err) => {
        console.error(err);
        setFeedback("Sorry, something went wrong. Please try again later.");
        setBuyingTokens(false);
      });

    console.log("[+] Done");
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 2) {
      newMintAmount = 2;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <s.Screen>
      <Nav />
      <div className="header"
        style={{
          backgroundImage: `url(${header})`,
          width: '100%',
          height: '100vh',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <s.Container flex={1} ai={"center"}>
          <StyledLogo className="logo-txt">Toon</StyledLogo>
          <p className="header-mint-txt text-2xl text-center text-white">ICO LIVE NOW!</p>
          <s.SpacerSmall />
          <ResponsiveWrapper flex={1} style={{ padding: 24 }} test>
            <s.SpacerLarge />
            <s.Container flex={2} jc={"center"} ai={"center"} style={{}}>
              <s.TextTitle
                style={{
                  textAlign: "center",
                  fontSize: 50,
                  fontWeight: "bold",
                  color: "var(--accent-text)",
                }}
              >
                {data.totalSupply} / {CONFIG.MAX_SUPPLY}
              </s.TextTitle>
              <s.TextDescription
                style={{
                  textAlign: "center",
                  color: "var(--primary-text)",
                }}
              >
                <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                  {truncate(CONFIG.CONTRACT_ADDRESS, 25)}
                </StyledLink>
              </s.TextDescription>
              <s.SpacerSmall />
              {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
                <>
                  <s.TextTitle style={{ textAlign: "center", color: "green" }}>The sale has ended.</s.TextTitle>
                  <s.TextDescription style={{ textAlign: "center", color: "var(--accent-text)" }}>
                    You can still find {CONFIG.NFT_NAME} on
                  </s.TextDescription>
                  <s.SpacerSmall />
                  <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                    {CONFIG.MARKETPLACE}
                  </StyledLink>
                </>
              ) : (
                <>
                  <s.TextTitle style={{ textAlign: "center", color: "var(--accent-text)" }}>
                    1 {CONFIG.SYMBOL} costs {CONFIG.DISPLAY_COST} {CONFIG.NETWORK.SYMBOL}.
                  </s.TextTitle>
                  <s.SpacerSmall />
                  {blockchain.account === "" || blockchain.smartContract === null ? (
                    <s.Container ai={"center"} jc={"center"}>
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent-text)",
                        }}
                      >
                        Connect to the {CONFIG.NETWORK.NAME} network
                      </s.TextDescription>
                      <s.SpacerSmall />
                      <StyledButton
                        style={{
                          color: "var(--primary-text)",
                          fontSize: "large",
                        }}
                        className="hover:bg-green-400"
                        onClick={(e) => {
                          e.preventDefault();
                          dispatch(connect());
                          getData();
                        }}
                      >
                        Connect
                      </StyledButton>
                      {blockchain.errorMsg !== "" ? (
                        <>
                          <s.SpacerSmall />
                          <s.TextDescription
                            style={{
                              textAlign: "center",
                              color: "var(--accent-text)",
                            }}
                          >
                            {blockchain.errorMsg}
                          </s.TextDescription>
                        </>
                      ) : null}
                    </s.Container>
                  ) : (
                    <>
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent-text)",
                        }}
                      >
                        {feedback}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <s.Container ai={"center"} jc={"center"} fd={"row"}>
                        <StyledRoundButton
                          style={{ lineHeight: 0.4, color: "var(--secondary)" }}
                          disabled={buyingTokens ? 1 : 0}
                          onClick={(e) => {
                            e.preventDefault();
                            decrementMintAmount();
                          }}
                        >
                          -
                        </StyledRoundButton>
                        <s.SpacerMedium />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {mintAmount}
                        </s.TextDescription>
                        <s.SpacerMedium />
                        <StyledRoundButton
                          style={{
                            color: "var(--secondary)",
                          }}
                          disabled={buyingTokens ? 1 : 0}
                          onClick={(e) => {
                            e.preventDefault();
                            incrementMintAmount();
                          }}
                        >
                          +
                        </StyledRoundButton>
                      </s.Container>
                      <s.SpacerSmall />
                      <s.Container ai={"center"} jc={"center"} fd={"row"}>
                        <StyledButton
                          style={{ marginTop: '50px', ...(blockchain.account !== data.contractOwner) ? disabledStyle : {} }}
                          disabled={(mintingERC20 ? 1 : 0) || (blockchain.account !== data.contractOwner)}
                          onClick={(e) => {
                            e.preventDefault();
                            mintERC20();
                            getData();
                          }}
                        >
                          {mintingERC20 ? "Minting.." : "Owner Mint"}
                        </StyledButton>
                      </s.Container>
                      <s.Container ai={"center"} jc={"center"} fd={"row"}>
                        <StyledButton
                          style={{ marginTop: '50px' }}
                          disabled={buyingTokens ? 1 : 0}
                          onClick={(e) => {
                            e.preventDefault();
                            buyTokens();
                            getData();
                          }}
                        >
                          {buyingTokens ? "Buying.." : "ICO Buy"}
                        </StyledButton>
                      </s.Container>
                    </>
                  )}
                </>
              )}
              <s.SpacerMedium />
            </s.Container>
            <s.SpacerLarge />
          </ResponsiveWrapper>
          <s.SpacerMedium />
        </s.Container>
      </div>
    </s.Screen>
  );
}

export default App;

const disabledStyle = {
  opacity: '0.5',
  cursor: 'not-allowed'
};
