import store from "../store";

const fetchDataRequest = () => {
  return {
    type: "CHECK_DATA_REQUEST",
  };
};

const fetchDataSuccess = (payload) => {
  return {
    type: "CHECK_DATA_SUCCESS",
    payload: payload,
  };
};

const fetchDataFailed = (payload) => {
  return {
    type: "CHECK_DATA_FAILED",
    payload: payload,
  };
};

export const fetchData = () => {
  return async (dispatch) => {
    dispatch(fetchDataRequest());
    try {

      const state = store.getState();
      const contract = state.blockchain.smartContract;

      let totalSupply = await contract.methods.totalSupply().call();
      console.log("[+] Data", totalSupply);

      // Assuming SALE_DURATION and owner are public state variables in your contract
      let saleDuration = await contract.methods.SALE_DURATION().call();
      console.log("[+] Data", saleDuration);
      let contractOwner = await contract.methods.owner().call();
      console.log("[+] Data", contractOwner);

      dispatch(
        fetchDataSuccess({
          totalSupply,
          saleDuration,
          contractOwner,
        })
      );
    } catch (err) {
      console.log(err);
      dispatch(fetchDataFailed("Could not load data from contract."));
    }
  };
};
