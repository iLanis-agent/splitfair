#!/usr/bin/env python3
"""Independent oracle: exact Fractions, cutoff-sweep method (differs from engine's greedy
transfer loop). Efficient allocations are ratio-ordered; sweep a cutoff until points tie."""
import json, random
from fractions import Fraction as F
def solve(items):
    sa=sum(F(a) for _,a,_ in items); sb=sum(F(b) for _,_,b in items)
    it=[(n,F(a)*100/sa,F(b)*100/sb) for n,a,b in items]
    # order by a/b descending: A takes from the top, B from the bottom
    key=lambda t: (t[1]/t[2]) if t[2]>0 else F(10**18)
    o=sorted(it,key=key,reverse=True)
    best=None
    # A gets prefix [0:k) fully, item k fractionally (fa=x), rest to B
    for k in range(len(o)+1):
        pa=sum(t[1] for t in o[:k]); pb=sum(t[2] for t in o[k+1:]) if k<len(o) else F(0)
        if k==len(o):
            if pa==F(0)+sum(t[2] for t in []): pass
            continue
        a,b=o[k][1],o[k][2]
        # solve pa + a*x = pb + b*(1-x)
        if a+b==0: continue
        x=(pb+b-pa)/(a+b)
        if 0<=x<=1:
            return {'pa':float(pa+a*x),'pb':float(pb+b*(1-x)),'fa':{o[j][0]:float(1 if j<k else (x if j==k else 0)) for j in range(len(o))}}
    return None
random.seed(408)
cases=[]
fixed=[[("house",60,70),("car",25,5),("boat",15,25)],
 [("a",50,10),("b",30,30),("c",20,60)],
 [("piano",40,10),("tv",10,40),("rug",25,25),("lamp",25,25)],
 [("x",100,0),("y",0,100)],
 [("x",1,1),("y",1,1),("z",1,1)]]
for f in fixed: cases.append(f)
for i in range(40):
    n=random.randint(2,8)
    cases.append([("i%d"%j,random.randint(0,50),random.randint(0,50)) for j in range(n)])
out=[]
for c in cases:
    if sum(a for _,a,_ in c)==0 or sum(b for _,_,b in c)==0: continue
    r=solve(c)
    if r: out.append({'items':[{'name':n,'a':a,'b':b} for n,a,b in c],'pa':r['pa'],'pb':r['pb'],'fa':r['fa']})
json.dump(out,open('tests/expected.json','w'),indent=1)
print(len(out),'cases')
