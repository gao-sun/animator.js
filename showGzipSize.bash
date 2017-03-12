gzip -kv dist/animator.min.js
ls -l dist/*.gz | awk '{total += $5} END {print "Total:", total}'
rm dist/animator.min.js.gz