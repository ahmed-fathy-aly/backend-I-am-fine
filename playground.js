var foo = (x) => {
  return new Promise((resolve, reject) => {
    resolve(x + 1);
  });
}

foo(0)
.then(a => {console.log(a); return foo(a); })
.then(b => {console.log(b); return foo(b); })
.then(c => {console.log(c); if(c == 4) return foo(c); throw null; })
.then(d => {console.log(d);  })
.catch(e => console.log(e));
