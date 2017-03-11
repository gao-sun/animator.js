gzip -kv dist/animator.js
ls -l dist/*.gz | awk '{total += $5} END {print "Total:", total}'
rm dist/animator.js.gz