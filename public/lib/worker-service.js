// importScripts('./pyodide.js');
importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js');

async function loadPyodideAndPackages() {
  self.pyodide = await loadPyodide();
  self.pyodide._api._skip_unwind_fatal_error = true;
  // await self.pyodide.loadPackage(['pygame-ce','random']);
}
let pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async (event) => {
  // make sure loading is done
  // Don't bother yet with this line, suppose our API is built in such a way:
  const { id, python, ...context } = event.data;
  await pyodideReadyPromise;
  // The worker copies the context in its own "memory" (an object mapping name to values)
  for (const key of Object.keys(context)) {
    self[key] = context[key];
  }
  
  // Now is the easy part, the one that is similar to working in the main thread:
  try {
    const res = await self.pyodide.loadPackagesFromImports(python);
    const needCanvas = python.indexOf('matplotlib')!==-1
    if(needCanvas) {
      self.pyodide.setStdout({
        batched: data => {
          self.postMessage({ results: `data:image/png;base64,${data}`, id, canvas: true });
        }
      })
    await self.pyodide.runPythonAsync(`import os
import base64
from io import BytesIO;
import matplotlib
import matplotlib.pyplot
matplotlib.use('AGG')
os.environ['MPLBACKEND'] = 'AGG'
_old_show = matplotlib.pyplot.show
def show():
  buf = BytesIO()
  matplotlib.pyplot.savefig(buf, format='png')
  buf.seek(0)
  # encode to a base64 str
  img = base64.b64encode(buf.read()).decode('utf-8')
  # matplotlib.pyplot.clf()
  print(img)
matplotlib.pyplot.show = show
${python}
`);
    } else {
      let results = await self.pyodide.runPythonAsync(python);
      console.log(results)
      self.postMessage({ results, id });
    }
  } catch (error) {
    self.postMessage({ error: error.message, id });
  }
};
