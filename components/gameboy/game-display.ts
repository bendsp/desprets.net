import { type ConsoleState, type Page } from "./console";
import { newGame, pieceCells, ghostPiece, PIECES, type Game, type FallingPiece } from "./games";
import { THEMES, type Palette } from "./themes";
import { pixelText as text } from "./pixel-font";
import { rect, center, header, footer, type Hit, type ScreenLayout } from "./screen-ui";

export function drawSettings(ctx: CanvasRenderingContext2D, state: ConsoleState, page: Extract<Page,{kind:"settings"}>, p: Palette): ScreenLayout {
  const hits: Hit[] = []; header(ctx,"SYSTEM / SETTINGS",p); text(ctx,"Color scheme",14,32,2,p.ink);
  THEMES.forEach((theme,index)=>{
    const x=14+index%2*154, y=56+Math.floor(index/2)*42, selected=page.selected===index, applied=state.palette===theme.id;
    rect(ctx,x,y,142,36,selected?p.accent:p.soft); if(selected)rect(ctx,x,y,3,36,p.highlight);
    text(ctx,theme.name,x+9,y+7,1,selected?p.paper:p.ink);
    if(applied)text(ctx,"ON",x+121,y+7,1,selected?p.highlight:p.accent);
    [theme.paper,theme.soft,theme.accent,theme.ink,theme.highlight].forEach((color,i)=>{rect(ctx,x+8+i*24,y+22,23,10,selected?p.paper:p.muted);rect(ctx,x+9+i*24,y+23,21,8,color);});
    hits.push({x,y,w:142,h:36,action:{palette:theme.id}});
  });
  text(ctx,"SAVED ON THIS DEVICE",14,183,1,p.muted); footer(ctx,p,"APPLY","BACK",hits); return {hits,limit:0};
}
export function drawGames(ctx: CanvasRenderingContext2D, state: ConsoleState, page: Extract<Page,{kind:"games"}>, p: Palette): ScreenLayout {
  const hits: Hit[] = []; header(ctx,"BEN / GAME LIBRARY",p);text(ctx,"Choose a game",14,32,2,p.ink);
  (["snake","tetris"] as const).forEach((kind,index)=>{
    const x=14+index*154, active=page.selected===index;
    rect(ctx,x+2,57,142,121,p.soft);rect(ctx,x,55,142,121,active?p.accent:p.soft);
    if(active)rect(ctx,x,55,3,121,p.highlight);
    text(ctx,kind.toUpperCase(),x+13,65,2,active?p.paper:p.ink);
    if(kind==="snake") {
      [[0,2],[1,2],[2,2],[2,1],[2,0],[3,0],[4,0],[4,1]].forEach(([dx,dy],i)=>{rect(ctx,x+28+dx*14,98+dy*14,12,12,active?p.highlight:p.accent);if(i===7){rect(ctx,x+30+dx*14,100+dy*14,2,2,p.ink);rect(ctx,x+36+dx*14,100+dy*14,2,2,p.ink);}});
      rect(ctx,x+106,124,7,7,active?p.paper:p.ink);
    } else {
      const blocks=[[0,2,0],[1,2,0],[2,2,0],[1,1,0],[3,2,1],[4,2,1],[3,1,1],[4,1,1],[0,0,2],[1,0,2],[2,0,2]];
      blocks.forEach(([dx,dy,c])=>{rect(ctx,x+29+dx*15,98+dy*14,13,12,[p.highlight,p.paper,active?p.soft:p.accent][c]);rect(ctx,x+30+dx*15,99+dy*14,10,1,"#ffffff60");});
    }
    text(ctx,`BEST ${String(state.records[kind]).padStart(5,"0")}`,x+13,158,1,active?p.paper:p.muted);
    hits.push({x,y:55,w:142,h:121,action:{page:{kind:"game",game:newGame(kind)}}});
  });
  footer(ctx,p,"LOAD","BACK",hits);return {hits,limit:0};
}
function metric(ctx:CanvasRenderingContext2D,label:string,value:number,x:number,y:number,p:Palette) { text(ctx,label,x,y,1,p.muted);text(ctx,String(value).padStart(4,"0"),x,y+13,2,p.ink); }
function block(ctx:CanvasRenderingContext2D,x:number,y:number,size:number,color:string,p:Palette,ghost=false) {
  if(ghost){ctx.strokeStyle=p.muted;ctx.lineWidth=1;ctx.strokeRect(x+1.5,y+1.5,size-3,size-3);return;}
  rect(ctx,x,y,size-1,size-1,color);rect(ctx,x+1,y+1,size-3,1,"#ffffff70");rect(ctx,x+size-3,y+2,1,size-4,"#00000030");
}
export function drawGame(ctx:CanvasRenderingContext2D,state:ConsoleState,game:Game,p:Palette):ScreenLayout {
  const hits:Hit[]=[];header(ctx,game.kind==="snake"?"SNAKE":"TETRIS",p);
  const running=game.status==="running";
  if(game.kind==="snake") {
    rect(ctx,10,32,184,148,p.ink);rect(ctx,12,34,180,144,p.soft);
    for(let y=0;y<16;y++)for(let x=0;x<20;x++)if((x+y)%2===0)rect(ctx,12+x*9,34+y*9,9,9,p.paper);
    game.snake.forEach((cell,i)=>{rect(ctx,13+cell.x*9,35+cell.y*9,7,7,i===0?p.ink:p.accent);});
    const head=game.snake[0],hx=13+head.x*9,hy=35+head.y*9;
    const eyes=game.direction==="up"?[[1,1],[5,1]]:game.direction==="down"?[[1,5],[5,5]]:game.direction==="left"?[[1,1],[1,5]]:[[5,1],[5,5]];
    eyes.forEach(([x,y])=>rect(ctx,hx+x,hy+y,1,1,p.highlight));
    if(game.food){const x=12+game.food.x*9,y=34+game.food.y*9;rect(ctx,x+2,y+3,5,4,p.ink);rect(ctx,x+3,y+2,3,5,p.highlight);rect(ctx,x+4,y+1,2,2,p.accent);}
    metric(ctx,"SCORE",game.score,210,40,p);metric(ctx,"BEST",state.records.snake,210,85,p);
    text(ctx,`LEVEL ${1+Math.floor(game.score/30)}`,210,132,1,p.muted);text(ctx,"D-PAD MOVE",210,156,1,p.ink);text(ctx,"SPACE PAUSE",210,171,1,p.muted);
  } else {
    const colors=state.palette==="color"||state.palette==="glacier"||state.palette==="berry"?["#58abb7","#527bb8","#da9a50","#d4b957","#7eaa76","#9b79b4","#c97180"]:[p.accent,p.ink,p.muted,p.highlight,p.ink,p.accent,p.muted];
    rect(ctx,112,27,84,164,p.ink);rect(ctx,114,29,80,160,p.paper);
    for(let y=0;y<20;y++)for(let x=0;x<10;x++){rect(ctx,114+x*8,29+y*8,1,1,p.soft);if(game.board[y][x])block(ctx,114+x*8,29+y*8,8,colors[game.board[y][x]-1],p);}
    const drawPiece=(piece:FallingPiece,ghost=false)=>pieceCells(piece).forEach(c=>{if(c.y>=0)block(ctx,114+c.x*8,29+c.y*8,8,colors[PIECES.indexOf(piece.kind)],p,ghost);});
    drawPiece(ghostPiece(game),true);drawPiece(game.active);
    metric(ctx,"SCORE",game.score,12,37,p);metric(ctx,"BEST",state.records.tetris,12,80,p);metric(ctx,"LINES",game.lines,12,123,p);text(ctx,`LEVEL ${1+Math.floor(game.lines/10)}`,12,173,1,p.muted);
    text(ctx,"NEXT",211,37,1,p.muted);
    game.queue.slice(0,3).forEach((kind,i)=>pieceCells({kind,rotation:0,x:0,y:0}).forEach(c=>block(ctx,220+c.x*7,52+i*31+c.y*7,7,colors[PIECES.indexOf(kind)],p)));
    text(ctx,"A/UP TURN",211,151,1,p.ink);text(ctx,"DOWN SOFT",211,164,1,p.muted);text(ctx,"SHIFT DROP",211,177,1,p.muted);
  }
  if(!running){
    rect(ctx,0,23,324,171,"#00000060");rect(ctx,29,51,266,120,p.ink);rect(ctx,31,53,262,116,p.paper);rect(ctx,37,59,250,2,p.accent);
    center(ctx,game.kind.toUpperCase(),72,3,p.ink);
    const label=game.status==="ready"?"READY TO PLAY":game.status==="paused"?"PAUSED":game.status==="won"?"BOARD CLEARED":"GAME OVER";
    center(ctx,label,101,1,p.accent);
    if(game.status==="ready") {center(ctx,game.kind==="snake"?"EAT. GROW. DON'T HIT THE WALL.":"FILL ROWS. KEEP THE STACK LOW.",119,1,p.muted);center(ctx,"D-PAD + A  /  SPACE TO PAUSE",137,1,p.muted);}
    else {center(ctx,`SCORE ${game.score}   BEST ${state.records[game.kind]}`,122,1,p.ink);center(ctx,game.status==="paused"?"YOUR GAME IS WAITING.":"ONE MORE ROUND?",140,1,p.muted);}
    footer(ctx,p,game.status==="ready"?"PLAY":game.status==="paused"?"RESUME":"RETRY","QUIT",hits);
  }else footer(ctx,p,game.kind==="snake"?"PAUSE":"ROTATE","PAUSE",hits);
  return {hits,limit:0};
}
