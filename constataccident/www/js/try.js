function writeMessage(message) {
        text.text(message);
        layer.draw();
      }
      
      var stage = new Kinetic.Stage({
        container: 'container', //ID du div sur lequel on joue
        width: 578,
        height: 200
      });
      
      var layer = new Kinetic.Layer();

      var text = new Kinetic.Text({
        x: 10,
        y: 10,
        fontFamily: 'Calibri',
        fontSize: 24,
        text: '',
        fill: 'black'
      });
      
      var box = new Kinetic.Rect({
        x: 289,
        y: 100,
        offset: [50, 25],
        width: 100,
        height: 50,
        fill: '#00D2FF',
        stroke: 'black',
        strokeWidth: 4,
        draggable: true
      });

      // write out drag and drop events
      box.on('dragstart', function() {
        writeMessage('dragstart');
      });
      box.on('dragend', function() {
        writeMessage('dragend');
      });

      layer.add(text);
      layer.add(box);
      stage.add(layer);