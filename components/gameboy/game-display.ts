import { type ConsoleState, type Page } from "./console";
import { newGame, pieceCells, ghostPiece, PIECES, type Game, type FallingPiece } from "./games";
import { SHELLS } from "./shells";
import { THEMES, type Palette } from "./themes";
import { screenText as text } from "./screen-font";
import { rect, center, type Hit, type ScreenLayout } from "./screen-ui";

export function drawSettings(ctx: CanvasRenderingContext2D, state: ConsoleState, page: Extract<Page,{kind:"settings"}>, p: Palette, offsets: readonly number[] = [0,0]): ScreenLayout {
  const hits: Hit[] = [];
  const rows = [
    {label:"Screen theme",options:THEMES.map(t=>({id:t.id,name:t.name,colors:[t.paper,t.accent]})),index:THEMES.findIndex(t=>t.id===state.palette)},
    {label:"Console color",options:SHELLS.map(t=>({id:t.id,name:t.name,colors:[t.body,t.edge]})),index:SHELLS.findIndex(t=>t.id===state.shell)},
  ];
  rows.forEach(({label,options,index},rowIndex)=>{
    const row=rowIndex===0?0:1, top=12+row*102, focused=page.selected===row;
    text(ctx,label,14,top,1.6,p.ink);
    const y=top+24;
    ctx.save(); ctx.beginPath(); ctx.rect(73,y,178,56); ctx.clip();
    [-2,-1,0,1,2].forEach(step=>{
      const option=options[(index+step+options.length)%options.length], x=73+step*190+(offsets[row]??0);
      rect(ctx,x,y,178,56,step===0?p.soft:p.paper);
      if(step===0 && focused)rect(ctx,x,y+53,178,3,p.accent);
      rect(ctx,x+12,y+12,32,32,option.colors[0]); rect(ctx,x+28,y+12,16,32,option.colors[1]);
      ctx.strokeStyle=p.muted;ctx.lineWidth=.5;ctx.strokeRect(x+12.25,y+12.25,31.5,31.5);
      text(ctx,option.name,x+54,y+20,1.6,step===0?p.ink:p.muted);
    });
    ctx.restore();
    [{x:12,direction:-1},{x:276,direction:1}].forEach(({x,direction})=>{
      rect(ctx,x,y+7,36,42,p.paper);
      ctx.strokeStyle=focused?p.accent:p.muted;ctx.lineWidth=2;ctx.lineCap="round";ctx.lineJoin="round";
      ctx.beginPath();ctx.moveTo(x+18-direction*3,y+21);ctx.lineTo(x+18+direction*3,y+28);ctx.lineTo(x+18-direction*3,y+35);ctx.stroke();
      hits.push({x:direction<0?0:251,y:y-7,w:73,h:70,action:{settingsRow:row,direction}});
    });
    hits.push({x:73,y,w:178,h:56,action:{settingsRow:row,direction:0}});
    const left=(324-options.length*10)/2;
    options.forEach((_,i)=>rect(ctx,left+i*10,top+87, i===index?7:4,2,i===index?p.accent:p.soft));
  });
  return {hits,limit:0};
}

export function drawGames(ctx: CanvasRenderingContext2D, state: ConsoleState, page: Extract<Page,{kind:"games"}>, p: Palette): ScreenLayout {
  const hits: Hit[] = [];
  (["snake","tetris"] as const).forEach((kind,index)=>{
    const x=14+index*154, active=page.selected===index;
    rect(ctx,x+2,14,142,190,p.soft);rect(ctx,x,12,142,190,active?p.accent:p.soft);
    if(active)rect(ctx,x,12,3,190,p.highlight);
    text(ctx,kind.toUpperCase(),x+13,28,2,active?p.paper:p.ink);
    if(kind==="snake") {
      [[0,2],[1,2],[2,2],[2,1],[2,0],[3,0],[4,0],[4,1]].forEach(([dx,dy],i)=>{rect(ctx,x+28+dx*14,98+dy*14,12,12,active?p.highlight:p.accent);if(i===7){rect(ctx,x+30+dx*14,100+dy*14,2,2,p.ink);rect(ctx,x+36+dx*14,100+dy*14,2,2,p.ink);}});
      rect(ctx,x+106,124,7,7,active?p.paper:p.ink);
    } else {
      const blocks=[[0,2,0],[1,2,0],[2,2,0],[1,1,0],[3,2,1],[4,2,1],[3,1,1],[4,1,1],[0,0,2],[1,0,2],[2,0,2]];
      blocks.forEach(([dx,dy,c])=>{rect(ctx,x+29+dx*15,98+dy*14,13,12,[p.highlight,p.paper,active?p.soft:p.accent][c]);rect(ctx,x+30+dx*15,99+dy*14,10,1,"#ffffff60");});
    }
    text(ctx,`BEST ${String(state.records[kind]).padStart(5,"0")}`,x+13,177,1,active?p.paper:p.muted);
    hits.push({x,y:12,w:142,h:190,action:{page:{kind:"game",game:newGame(kind)}}});
  });
  return {hits,limit:0};
}
function metric(ctx:CanvasRenderingContext2D,label:string,value:number,x:number,y:number,p:Palette) { text(ctx,label,x,y,1,p.muted);text(ctx,String(value).padStart(4,"0"),x,y+13,2,p.ink); }
function block(ctx:CanvasRenderingContext2D,x:number,y:number,size:number,color:string,p:Palette,ghost=false) {
  if(ghost){ctx.strokeStyle=p.muted;ctx.lineWidth=1;ctx.strokeRect(x+1.5,y+1.5,size-3,size-3);return;}
  rect(ctx,x,y,size-1,size-1,color);rect(ctx,x+1,y+1,size-3,1,"#ffffff70");rect(ctx,x+size-3,y+2,1,size-4,"#00000030");
}
export function drawGame(ctx:CanvasRenderingContext2D,state:ConsoleState,game:Game,p:Palette):ScreenLayout {
  const hits:Hit[]=[];
  const running=game.status==="running";
  if(game.kind==="snake") {
    ctx.save(); ctx.translate(10,24); ctx.scale(1.14,1.14); ctx.translate(-10,-32);
    rect(ctx,10,32,184,148,p.ink);rect(ctx,12,34,180,144,p.soft);
    for(let y=0;y<16;y++)for(let x=0;x<20;x++)if((x+y)%2===0)rect(ctx,12+x*9,34+y*9,9,9,p.paper);
    game.snake.forEach((cell,i)=>{rect(ctx,13+cell.x*9,35+cell.y*9,7,7,i===0?p.ink:p.accent);});
    const head=game.snake[0],hx=13+head.x*9,hy=35+head.y*9;
    const eyes=game.direction==="up"?[[1,1],[5,1]]:game.direction==="down"?[[1,5],[5,5]]:game.direction==="left"?[[1,1],[1,5]]:[[5,1],[5,5]];
    eyes.forEach(([x,y])=>rect(ctx,hx+x,hy+y,1,1,p.highlight));
    if(game.food){const x=12+game.food.x*9,y=34+game.food.y*9;rect(ctx,x+2,y+3,5,4,p.ink);rect(ctx,x+3,y+2,3,5,p.highlight);rect(ctx,x+4,y+1,2,2,p.accent);}
    ctx.restore();
    metric(ctx,"SCORE",game.score,234,32,p);metric(ctx,"BEST",state.records.snake,234,77,p);
    text(ctx,`LEVEL ${1+Math.floor(game.score/30)}`,234,124,1,p.muted);text(ctx,"D-PAD MOVE",234,157,1,p.ink);text(ctx,"SPACE PAUSE",234,174,1,p.muted);
  } else {
    const colors=state.palette==="color"||state.palette==="glacier"||state.palette==="berry"?["#58abb7","#527bb8","#da9a50","#d4b957","#7eaa76","#9b79b4","#c97180"]:[p.accent,p.ink,p.muted,p.highlight,p.ink,p.accent,p.muted];
    ctx.save(); ctx.translate(108,10); ctx.scale(1.2,1.2); ctx.translate(-112,-27);
    rect(ctx,112,27,84,164,p.ink);rect(ctx,114,29,80,160,p.paper);
    for(let y=0;y<20;y++)for(let x=0;x<10;x++){rect(ctx,114+x*8,29+y*8,1,1,p.soft);if(game.board[y][x])block(ctx,114+x*8,29+y*8,8,colors[game.board[y][x]-1],p);}
    const drawPiece=(piece:FallingPiece,ghost=false)=>pieceCells(piece).forEach(c=>{if(c.y>=0)block(ctx,114+c.x*8,29+c.y*8,8,colors[PIECES.indexOf(piece.kind)],p,ghost);});
    drawPiece(ghostPiece(game),true);drawPiece(game.active);
    ctx.restore();
    metric(ctx,"SCORE",game.score,12,37,p);metric(ctx,"BEST",state.records.tetris,12,80,p);metric(ctx,"LINES",game.lines,12,123,p);text(ctx,`LEVEL ${1+Math.floor(game.lines/10)}`,12,173,1,p.muted);
    text(ctx,"NEXT",211,37,1,p.muted);
    game.queue.slice(0,3).forEach((kind,i)=>pieceCells({kind,rotation:0,x:0,y:0}).forEach(c=>block(ctx,220+c.x*7,52+i*31+c.y*7,7,colors[PIECES.indexOf(kind)],p)));
    text(ctx,"A/UP TURN",211,151,1,p.ink);text(ctx,"DOWN SOFT",211,164,1,p.muted);text(ctx,"SHIFT DROP",211,177,1,p.muted);
  }
  if(!running){
    rect(ctx,0,0,324,216,"#00000060");rect(ctx,29,35,266,152,p.ink);rect(ctx,31,37,262,148,p.paper);rect(ctx,37,43,250,2,p.accent);
    center(ctx,game.kind.toUpperCase(),72,3,p.ink);
    const label=game.status==="ready"?"READY TO PLAY":game.status==="paused"?"PAUSED":game.status==="won"?"BOARD CLEARED":"GAME OVER";
    center(ctx,label,101,1,p.accent);
    if(game.status==="ready") {center(ctx,game.kind==="snake"?"EAT. GROW. DON'T HIT THE WALL.":"FILL ROWS. KEEP THE STACK LOW.",119,1,p.muted);center(ctx,"D-PAD + A  /  SPACE TO PAUSE",137,1,p.muted);}
    else {center(ctx,`SCORE ${game.score}   BEST ${state.records[game.kind]}`,122,1,p.ink);center(ctx,game.status==="paused"?"YOUR GAME IS WAITING.":"ONE MORE ROUND?",140,1,p.muted);}
    const action=game.status==="ready"?"PLAY":game.status==="paused"?"RESUME":"RETRY";
    [{x:43,label:action,control:"a" as const},{x:170,label:"QUIT",control:"b" as const}].forEach(({x,label,control})=>{
      rect(ctx,x,155,111,23,control==="a"?p.accent:p.soft);
      text(ctx,label,x+12,162,1,control==="a"?p.paper:p.ink);
      hits.push({x,y:155,w:111,h:23,action:{control}});
    });
  }
  return {hits,limit:0};
}
