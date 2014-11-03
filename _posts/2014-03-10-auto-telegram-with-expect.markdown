---
layout: post
title:  "Auto telegram with expect"
date:   2014-03-10 08:11:00
categories: IoT
tags: raspberryPi IoT DIY telegram expect
---

Para hacer que nuestra raspberry Pi se pueda comunicar al momento con nosotros, qué mejor que hacerlo directamente a nuestro móvil? Para eso usaremos telegram-cli, que es una librería que ataca a la api de telegram y nos permite poder enviar mensajes a nuestros contactos.
Para instalar telegram-cli podemos seguir los pasos de [su repo][telegram-repo].

Una vez lanzamos telegram en consola,nos pedirá un móvil y nos creará usuario si no tenemos. Para ver las posibilidades, con un help basta para entender los 4 comandos básicos para poder enviar comandos manuales a otros usuarios de telegram.

Hasta aquí podemos enviar mensajes manuales, pero no podemos automatizarlo de forma que nuestra raspberry o otros devices nos envíen mensajes de lo que queramos. Para poder lograr esta automatización podemos tocar el código del telegram-cli o algo más sencillo… usar expect! ;)

Expect es una extension de TCL, lenguaje de scripting, basado en las respuestas de la consola. Con él podemos simular una interacción manual con programas de consola. Si queréis más info podéis buscar tutoriales por google.

Con un simple script como este…

{% highlight bash %}
#!/usr/bin/expect
set timeout 2
set message [lindex $argv 1]
set destination [lindex $argv 0]
spawn /opt/tg/telegram
expect "> "
sleep 1
send "\rmsg $destination $message\r"
expect "> "
expect eof
{% endhighlight %}

…es suficiente para mandar un mensaje con una línea de comando.

{% highlight bash %}
pi@raspberry:~$ /opt/tg/sendTo grupoTelegram "Hola a todos!!"
{% endhighlight %}

oleeé!

[telegram-repo]:  https://github.com/vysheng/tg#telegram-messenger-cli-
