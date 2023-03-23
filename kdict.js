const fdict = {
    "apple": "蘋果",
    "banana": "香蕉",
};
  
  const dict_callmodule = {
    "bot": "text-davinci-003",
    "kyle": "text-davinci-003",
    "bot35": "gpt-3.5-turbo",
    "kyle35": "gpt-3.5-turbo"
  };
  function getValue(key, dict) {
    return (key in dict) ? dict[key] : "nono Error";
}
  module.exports = {
    fdict,
    dict_callmodule,
    getValue
  };
  