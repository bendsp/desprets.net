// Standard retail SP finishes. Colors are tuned for our scene lighting, not measured paint samples.
// Standard-color references (regional names vary):
// https://www.nintendo.co.jp/n08/hardware/gbasp/index.html
// https://www.nintendoworldreport.com/pr/8960/flame-and-onyx-gba-sps-now-available
// https://maru-chang.com/hard/agb/english.htm
// Special editions with printed artwork are not represented by these solid finishes.
export const SHELLS = [
  {id:"platinum",name:"Platinum",body:"#bfc2c5",edge:"#8c949f",well:"#a9afb5",floor:"#b7bdc3",buttons:"#797d78",pad:"#888e87",label:"#656d6e",metalness:.5},
  {id:"cobalt",name:"Cobalt",body:"#254fb0",edge:"#183476",well:"#36569a",floor:"#294a91",buttons:"#777c86",pad:"#536784",label:"#c0c8d6",metalness:.42},
  {id:"flame",name:"Flame Red",body:"#c52c35",edge:"#831e29",well:"#a42a32",floor:"#b72e37",buttons:"#55585e",pad:"#762c35",label:"#e1bdba",metalness:.35},
  {id:"onyx",name:"Onyx",body:"#252830",edge:"#171b23",well:"#373c45",floor:"#292e38",buttons:"#555962",pad:"#3e4249",label:"#aeb4bc",metalness:.24},
  {id:"pearl-blue",name:"Pearl Blue",body:"#98bfcd",edge:"#658eaa",well:"#88adbf",floor:"#a3c6d4",buttons:"#697b87",pad:"#759caa",label:"#465f70",metalness:.38},
  {id:"pearl-pink",name:"Pearl Pink",body:"#e0a6b6",edge:"#b37891",well:"#c891a5",floor:"#dca5ba",buttons:"#8c7580",pad:"#b98096",label:"#795365",metalness:.32},
  {id:"graphite",name:"Graphite",body:"#555962",edge:"#353942",well:"#626873",floor:"#505662",buttons:"#393d45",pad:"#444953",label:"#c0c5cc",metalness:.45},
] as const;
export type ShellId = typeof SHELLS[number]["id"];
export type Shell = typeof SHELLS[number];
export const shellFor = (id: ShellId): Shell => SHELLS.find(shell=>shell.id===id) ?? SHELLS[0];
export const isShell = (value: unknown): value is ShellId => SHELLS.some(shell=>shell.id===value);
