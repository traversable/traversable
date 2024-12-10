---
"@traversable/openapi": patch
---

### new features

This PR sets the groundwork for using recursion schemes to handle mappings between categories.

I wasn't sure about the stack safety / how hard it would be, but wow! Everything just seems to work faster. Weirdly, 
the types seem to be working better too (shaved ~4 seconds off the build time).
