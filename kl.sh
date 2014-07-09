if [ ! -n "$1" ]
then
  konf=spec/config/karma.conf.js
else
  if [ "$1" = 'unit' ]
  then
    konf=spec/config/karma.conf.js
  fi

  if [ "$1" = 'integration' ] || [ "$1" = 'int' ]
  then
    konf=spec/config/karma.integration.conf.js
  fi

  if [ ! -n "$konf" ]
  then
    konf=$1
  fi
fi

karma start $konf --no-single-run --auto-watch

