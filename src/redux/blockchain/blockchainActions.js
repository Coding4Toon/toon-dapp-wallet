// constants
import Web3EthContract from "web3-eth-contract";
import Web3 from "web3";
// log
import { fetchData } from "../data/dataActions";

const connectRequest = () => {
  return {
    type: "CONNECTION_REQUEST",
  };
};

const connectSuccess = (payload) => {
  return {
    type: "CONNECTION_SUCCESS",
    payload: payload,
  };
};

const connectFailed = (payload) => {
  return {
    type: "CONNECTION_FAILED",
    payload: payload,
  };
};

const updateAccountRequest = (payload) => {
  return {
    type: "UPDATE_ACCOUNT",
    payload: payload,
  };
};

// Connect wallet and detect network

// Action creator named 'connect'
export const connect = () => {

  // This function returns a function that takes 'dispatch' as an argument
  // which is a typical pattern for asynchronous actions in Redux using the 'redux-thunk' middleware.
  return async (dispatch) => {

    // Initially dispatch a 'connectRequest' action to indicate the start of the connection process
    dispatch(connectRequest());

    // Fetch the ABI (Application Binary Interface) from a local JSON file
    const abiResponse = await fetch("/config/abi.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const abi = await abiResponse.json();

    // Fetch configuration details from a local JSON file
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const CONFIG = await configResponse.json();

    // Check if MetaMask is installed in the browser
    const { ethereum } = window;
    const metamaskIsInstalled = ethereum && ethereum.isMetaMask;

    if (metamaskIsInstalled) {

      // Set the Ethereum provider to MetaMask for the Web3EthContract class
      Web3EthContract.setProvider(ethereum);

      // Create a new instance of Web3 using MetaMask as a provider
      let web3 = new Web3(ethereum);

      try {
        // Request access to user accounts in MetaMask
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });

        // Get the current network ID from MetaMask
        const networkId = await ethereum.request({
          method: "net_version",
        });

        // Check if the current network ID matches the expected network ID from the config
        if (networkId == CONFIG.NETWORK.ID) {

          // Create a new contract instance using the ABI and contract address from the config
          const SmartContractObj = new Web3EthContract(
            abi,
            CONFIG.CONTRACT_ADDRESS
          );

          // Dispatch a 'connectSuccess' action with relevant data
          dispatch(
            connectSuccess({
              account: accounts[0],
              smartContract: SmartContractObj,
              web3: web3,
            })
          );

          // Add event listeners to MetaMask for account changes and network changes
          ethereum.on("accountsChanged", (accounts) => {
            dispatch(updateAccount(accounts[0]));  // Update the current account in the store
          });

          ethereum.on("chainChanged", () => {
            window.location.reload();  // Reload the page if the network is changed
          });
        } else {

          // If network ID doesn't match, dispatch an error message asking the user to switch networks
          dispatch(connectFailed(`Change network to ${CONFIG.NETWORK.NAME}.`));
        }
      } catch (err) {

        // If any error occurs, dispatch a generic error message
        dispatch(connectFailed("Something went wrong."));
      }
    } else {

      // If MetaMask is not installed, dispatch an error message instructing the user to install MetaMask
      dispatch(connectFailed("Install Metamask."));
    }
  };
};


//**************************************

export const updateAccount = (account) => {
  return async (dispatch) => {
    dispatch(updateAccountRequest({ account: account }));
    dispatch(fetchData(account));
  };
};
